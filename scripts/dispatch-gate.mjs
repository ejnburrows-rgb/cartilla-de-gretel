/**
 * Pre-dispatch gate + race-safe ownership reservation.
 * Dependency-free. Fails closed: anything unknown is BLOCKED or REJECTED, never accepted.
 *
 * STATUS: implemented, NOT ACTIVE. Muse's real dispatcher is outside this repository. Work is
 * only protected when the dispatcher launches the worker through `dispatch` (below). See
 * docs/EXECUTION_CONTROL.md for the entry-point and bypass table.
 *
 * Exit codes: 0 ACCEPTED, 1 REJECTED, 2 BLOCKED, 64 usage error.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { normalizePath, pathsOverlap, validateOwnerMessage } from './check-merge-policy.mjs';

export const ONLY_DISPATCHER = 'muse';
export const DENIED_PROVIDERS = ['antigravity', 'google-antigravity', 'anti-gravity'];
export const STATE_MAX_AGE_MS = 10 * 60 * 1000;
export const RESERVATION_TTL_MS = 6 * 60 * 60 * 1000;
const RESERVED_STATES = new Set(['reserved', 'running']);
const SATISFIED_DEPENDENCY = new Set(['done', 'merged']);
const nonEmpty = v => typeof v === 'string' && v.trim().length > 0;
const hasItems = v => Array.isArray(v) && v.length > 0;
const h = v => crypto.createHash('sha1').update(String(v)).digest('hex').slice(0, 20);
const safe = v => String(v).replace(/[^A-Za-z0-9._-]/g, '_');
/** One claim key per (normalized path, work id) so shared and exclusive claims can be cross-checked after taking them. */
export const fileKey = (p, id) => 'fc-' + h(normalizePath(p) ?? p) + '-' + safe(id);
export const slotKey = (provider, i) => 'slot-' + safe(provider) + '-' + i;
export const branchKey = b => 'br-' + h(b);
export const workItemKey = k => 'wk-' + h(k);
export const allocatable = prov => (Number.isInteger(prov?.totalSlots) && Number.isInteger(prov?.externalBusy) ? Math.max(0, prov.totalSlots - prov.externalBusy) : 0);
export const workKey = id => 'work-' + String(id).replace(/[^A-Za-z0-9._-]/g, '_');

export function validateAssignment(a, state, { now = Date.now() } = {}) {
  const reasons = [];
  const add = (decision, code, detail, extra = {}) => reasons.push({ decision, code, detail, ...extra });
  const input = a && typeof a === 'object' ? a : {};
  const files = [];
  const reclaims = [];
  const result = () => {
    const decision = reasons.some(r => r.decision === 'REJECTED') ? 'REJECTED'
      : reasons.some(r => r.decision === 'BLOCKED') ? 'BLOCKED' : 'ACCEPTED';
    return { decision, assignmentId: input.id ?? null, policyRevision: state?.mainSha ?? null, reasons, files, reclaims };
  };

  // ---- structure (stable identity, owner/worker, refs, acceptance) ----
  for (const f of ['id', 'requester', 'owner', 'worker', 'provider', 'scopeRef', 'policyRevision']) {
    if (!nonEmpty(input[f])) add('REJECTED', 'MISSING_FIELD', `${f} is required`, { field: f });
  }
  if (!input.gap || !nonEmpty(input.gap.requirement) || !nonEmpty(input.gap.evidenceRef)) add('REJECTED', 'GAP_NOT_EVIDENCED', 'gap.requirement and gap.evidenceRef (unfinished requirement) are required');
  if (!hasItems(input.instructionRefs)) add('REJECTED', 'NO_INSTRUCTION_REF', 'instructionRefs must cite current authoritative instruction files');
  if (!hasItems(input.acceptance) || !input.acceptance.every(c => c && ['command', 'render'].includes(c.kind) && nonEmpty(c.ref))) add('REJECTED', 'ACCEPTANCE_NOT_TESTABLE', 'every acceptance item needs kind (command|render) and ref');
  if (!Array.isArray(input.dependsOn)) add('REJECTED', 'MISSING_FIELD', 'dependsOn must be an array (empty if none)', { field: 'dependsOn' });
  if (!input.reuse || input.reuse.checked !== true || !hasItems(input.reuse.refs)) add('REJECTED', 'REUSE_NOT_SHOWN', 'reuse.checked=true and reuse.refs[] (existing branches/PRs/proof inspected) are required');

  // ---- declared files, normalized (case, slashes, ./, ..); invalid paths are rejected ----
  const claims = [];
  if (!hasItems(input.files) || !input.files.every(f => f && nonEmpty(f.path) && ['exclusive', 'shared'].includes(f.mode))) add('REJECTED', 'FILES_UNDECLARED', 'files[] needs path and mode (exclusive|shared)');
  else {
    for (const f of input.files) {
      const n = normalizePath(f.path);
      if (n === null) { add('REJECTED', 'PATH_INVALID', `invalid or repo-escaping path: ${f.path}`, { files: [f.path] }); continue; }
      const prior = claims.find(c => pathsOverlap(c.path, n));
      if (prior) { if (f.mode === 'exclusive') prior.mode = 'exclusive'; if (prior.path.length > n.length) prior.path = n; continue; }
      claims.push({ path: n, mode: f.mode });
    }
  }

  // ---- who may dispatch / which provider ----
  if (nonEmpty(input.requester) && input.requester !== ONLY_DISPATCHER) add('REJECTED', 'UNAUTHORIZED_DISPATCHER', `only ${ONLY_DISPATCHER} may create assignments (got ${input.requester})`);
  if (nonEmpty(input.provider) && DENIED_PROVIDERS.includes(input.provider.toLowerCase())) add('REJECTED', 'PROVIDER_DENIED', `${input.provider} is denied by owner policy`);

  // ---- live state: required, complete, fresh. Missing sections are unknown, never "empty". ----
  if (!state || typeof state !== 'object') { add('BLOCKED', 'STATE_UNAVAILABLE', 'no state snapshot; cannot verify ownership, provider or authorization'); return result(); }
  const incomplete = [];
  for (const k of ['openPRs', 'reservations']) if (!Array.isArray(state[k])) incomplete.push(k);
  for (const k of ['workItems', 'fileOwnership', 'authorizations', 'providers']) if (!state[k] || typeof state[k] !== 'object' || Array.isArray(state[k])) incomplete.push(k);
  if (incomplete.length) { add('BLOCKED', 'STATE_INCOMPLETE', `snapshot is missing required sections: ${incomplete.join(', ')}`); return result(); }
  const age = now - Date.parse(state.capturedAt);
  if (!nonEmpty(state.capturedAt) || Number.isNaN(age)) add('BLOCKED', 'STATE_UNAVAILABLE', 'state.capturedAt missing or invalid');
  else if (age > STATE_MAX_AGE_MS || age < -60000) add('BLOCKED', 'STATE_STALE', `state snapshot is ${Math.round(age / 1000)}s old (max ${STATE_MAX_AGE_MS / 1000}s)`);
  if (!nonEmpty(state.mainSha)) add('BLOCKED', 'STATE_UNAVAILABLE', 'state.mainSha missing');
  else if (nonEmpty(input.policyRevision) && input.policyRevision !== state.mainSha) add('REJECTED', 'STALE_POLICY_REVISION', `assignment cites ${input.policyRevision}, current main is ${state.mainSha}`);

  // ---- authorization (owner message provenance must be well formed) ----
  const scope = state.authorizations[input.scopeRef];
  if (!scope) add('BLOCKED', 'UNKNOWN_AUTHORIZATION', `no authorization record for ${input.scopeRef}`);
  else if (scope.status !== 'approved') add('REJECTED', 'SCOPE_UNAUTHORIZED', `${input.scopeRef} status=${scope.status}`);
  else { const pe = validateOwnerMessage(scope, { now }); if (pe.length) add('REJECTED', 'SCOPE_UNAUTHORIZED', `${input.scopeRef}: ${pe.join('; ')}`); }

  // ---- provider availability (capacity itself is reserved atomically in reserve()) ----
  const prov = state.providers[input.provider];
  if (!prov || prov.available === undefined || prov.available === null || !Number.isInteger(prov.totalSlots) || !Number.isInteger(prov.externalBusy)) add('BLOCKED', 'PROVIDER_UNVERIFIED', `no verified capacity (available, totalSlots, externalBusy) for ${input.provider}`);
  else if (prov.available !== true || allocatable(prov) < 1) add('REJECTED', 'PROVIDER_UNAVAILABLE', `${input.provider} available=${prov.available} allocatable=${allocatable(prov)}`);

  // ---- real gap, not already done ----
  const item = state.workItems[input.id];
  if (item && SATISFIED_DEPENDENCY.has(item.state)) add('REJECTED', 'ALREADY_DONE', `${input.id} is ${item.state}`);

  // ---- duplicates, stale reservations, file conflicts against other workers ----
  const staleOwners = Array.isArray(state.providerVerifiedDead) ? state.providerVerifiedDead : [];
  for (const r of state.reservations) {
    if (!RESERVED_STATES.has(r.state)) continue;
    const rfiles = (r.files ?? []).map(f => ({ path: normalizePath(f.path), mode: f.mode })).filter(f => f.path);
    const stale = Number.isNaN(Date.parse(r.heartbeatAt)) || now - Date.parse(r.heartbeatAt) > RESERVATION_TTL_MS;
    const sameWork = r.id === input.id || (nonEmpty(input.workKey) && r.workKey === input.workKey) || (nonEmpty(input.branch) && r.branch === input.branch);
    const clash = claims.filter(c => rfiles.some(rf => pathsOverlap(c.path, rf.path) && (c.mode === 'exclusive' || rf.mode === 'exclusive'))).map(c => c.path);
    if (!sameWork && clash.length === 0) continue;
    const dead = staleOwners.find(d => d && d.id === r.id && nonEmpty(d.token) && d.token === r.token);
    if (stale && dead) { reclaims.push({ id: r.id, token: r.token, files: r.files ?? [], provider: r.provider, slot: r.slot }); continue; }
    if (stale) add('REJECTED', 'STALE_RESERVATION', `${r.id} (owner ${r.owner}) has no heartbeat since ${r.heartbeatAt}; verify the provider session is dead for this exact reservation token (providerVerifiedDead [{id, token}]) before reassigning`, { reservation: r.id });
    else if (sameWork) add('REJECTED', 'DUPLICATE_ASSIGNMENT', `${r.id} already reserved by ${r.owner}; recover it instead`, { reservation: r.id });
    else add('REJECTED', 'FILE_CONFLICT_EXCLUSIVE', `files held by ${r.id}: ${clash.join(', ')}`, { reservation: r.id, files: clash });
  }
  for (const pr of state.openPRs) {
    if ((nonEmpty(pr.workId) && pr.workId === input.id) || (nonEmpty(input.branch) && pr.headRef === input.branch)) add('REJECTED', 'DUPLICATE_ASSIGNMENT', `open PR #${pr.number} already carries this work`, { pr: pr.number });
  }

  // ---- dependencies ----
  for (const dep of input.dependsOn ?? []) {
    const d = state.workItems[dep];
    if (!d) add('BLOCKED', 'DEPENDENCY_UNKNOWN', `state of ${dep} unknown`, { dependency: dep });
    else if (!SATISFIED_DEPENDENCY.has(d.state)) add('BLOCKED', 'DEPENDENCY_UNSATISFIED', `${dep} is ${d.state}`, { dependency: dep });
  }

  // ---- per-file classification (only the affected part is blocked) ----
  const considered = new Set((input.reuse?.considered ?? []).map(Number));
  const ownership = Object.fromEntries(Object.entries(state.fileOwnership).map(([k, v]) => [normalizePath(k) ?? k, v]));
  for (const c of claims) {
    const held = state.reservations.some(r => RESERVED_STATES.has(r.state) && (r.files ?? []).some(rf => { const n = normalizePath(rf.path); return n && pathsOverlap(c.path, n) && (c.mode === 'exclusive' || rf.mode === 'exclusive'); }) && r.id !== input.id);
    const unknown = Object.entries(ownership).some(([k, v]) => v === 'unknown' && pathsOverlap(c.path, k));
    const overlapping = state.openPRs.filter(p => (p.files ?? []).some(f => { const n = normalizePath(f); return n && pathsOverlap(c.path, n); })).map(p => p.number);
    let cls = 'independent';
    if (held) cls = 'exclusive_conflict';
    else if (unknown) cls = 'uncertain';
    else if (overlapping.length) cls = 'shared_dependency';
    files.push({ path: c.path, mode: c.mode, class: cls, overlappingPRs: overlapping });
    if (cls === 'uncertain') add('BLOCKED', 'FILE_OWNERSHIP_UNCERTAIN', `owner of ${c.path} unknown; only this file is blocked`, { files: [c.path] });
    for (const n of overlapping) if (!considered.has(n)) add('REJECTED', 'REUSE_NOT_ADDRESSED', `open PR #${n} touches ${c.path}; list it in reuse.considered with a reuse/supersede decision`, { pr: n });
  }
  return result();
}

// ---------------- reservation backends ----------------
/** Local backend: O_EXCL files. Race-safe on ONE shared filesystem only. */
export function localBackend(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const p = k => path.join(dir, k + '.json');
  return {
    kind: 'local',
    acquire(entries, token) {
      const made = [];
      for (const [k, payload] of entries) {
        try {
          const fd = fs.openSync(p(k), 'wx');
          fs.writeSync(fd, JSON.stringify({ ...payload, token }));
          fs.closeSync(fd);
          made.push(k);
        } catch (e) {
          for (const m of made) fs.rmSync(p(m), { force: true });
          return { ok: false, conflictKey: k, error: e.code === 'EEXIST' ? 'EXISTS' : e.code };
        }
      }
      return { ok: true };
    },
    release(keys, token) {
      for (const k of keys) {
        try { if (typeof token === 'string' && JSON.parse(fs.readFileSync(p(k), 'utf8')).token === token) fs.rmSync(p(k), { force: true }); } catch { /* already gone */ }
      }
    },
    list() {
      return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
    },
  };
}

/**
 * Git-ref backend: each key is a ref refs/reservations/<key> on a shared remote (GitHub or a bare
 * repo). Creation uses one `git push --atomic` without force: a second creator of an existing ref
 * is rejected by the server, so the claim is atomic across machines. Needs push credentials for
 * refs/reservations/* (owner-side; NOT granted to Instinct).
 */
export function gitRefBackend(repoDir, remote = 'origin') {
  const git = (args, input) => spawnSync('git', args, { cwd: repoDir, encoding: 'utf8', input });
  const ref = k => `refs/reservations/${k}`;
  const emptyTree = () => git(['hash-object', '-t', 'tree', '/dev/null']).stdout.trim();
  const commit = (payload, token) => git(['-c', 'user.name=gate', '-c', 'user.email=gate@invalid', 'commit-tree', emptyTree(), '-m', JSON.stringify({ ...payload, token })]).stdout.trim();
  return {
    kind: 'git-ref',
    acquire(entries, token) {
      const specs = entries.map(([k, payload]) => `${commit(payload, token)}:${ref(k)}`);
      const r = git(['push', '--atomic', remote, ...specs]);
      return r.status === 0 ? { ok: true } : { ok: false, conflictKey: null, error: (r.stderr || '').trim().split('\n').slice(-2).join(' ') };
    },
    release(keys, token) {
      for (const k of keys) {
        const cur = git(['ls-remote', remote, ref(k)]).stdout.split(/\s+/)[0];
        if (!cur) continue;
        git(['fetch', '-q', remote, `${ref(k)}:${ref(k)}`, '--force']);
        const msg = git(['log', '-1', '--format=%B', ref(k)]).stdout;
        try { if (typeof token !== 'string' || JSON.parse(msg).token !== token) continue; } catch { continue; }
        git(['push', `--force-with-lease=${ref(k)}:${cur}`, remote, `:${ref(k)}`]);
      }
    },
    list() {
      const refs = git(['ls-remote', remote, 'refs/reservations/*']).stdout.split('\n').filter(Boolean).map(l => l.split(/\s+/)[1]);
      if (refs.length) git(['fetch', '-q', remote, ...refs.map(r => `${r}:${r}`), '--force']);
      return refs.map(r => { try { return JSON.parse(git(['log', '-1', '--format=%B', r]).stdout); } catch { return null; } }).filter(Boolean);
    },
  };
}

/** Other reservations in the ledger whose file claims conflict with ours (after normalization). */
function conflictsFor(ledger, id, claims) {
  const byId = new Map();
  for (const e of ledger) { if (e.kind === 'file-claim' && e.id !== id) (byId.get(e.id) ?? byId.set(e.id, []).get(e.id)).push(e); }
  const out = [];
  for (const [other, entries] of byId) {
    for (const mine of claims) for (const th of entries) if (pathsOverlap(mine.path, th.path) && (mine.mode === 'exclusive' || th.mode === 'exclusive')) out.push({ other, path: mine.path });
  }
  return out;
}

function sleepMs(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
export function reserve(backend, assignment, opts = {}) {
  let r;
  for (let attempt = 0; attempt < 5; attempt++) {
    r = reserveOnce(backend, assignment, { ...opts, token: undefined });
    if (r.ok || r.code !== 'FILE_CONFLICT') return r;
    sleepMs(5 + Math.floor(Math.random() * 40));
  }
  return r;
}

/**
 * Take ownership atomically: (1) a provider slot (O_EXCL / atomic ref, so capacity can never be oversubscribed),
 * (2) the work id, branch and workKey, (3) one claim per file, then (4) re-read the ledger and back off if a
 * conflicting claim from another worker is visible.  A claim only counts once the claimant has re-read the ledger and seen no conflict:  * conflicting requests cannot both keep their claims. Any failure rolls back everything this call took.
 * Both racers may see each other and both back off (safe); they retry with jitter, so at most one ever
 * holds the claim and a loser is rejected. Safety is guaranteed; liveness is best effort.
 */
function reserveOnce(backend, assignment, { now = Date.now(), token = crypto.randomUUID(), capacity } = {}) {
  const t = new Date(now).toISOString();
  const claims = [];
  for (const f of assignment.files ?? []) {
    const n = normalizePath(f.path);
    if (n === null) return { ok: false, code: 'PATH_INVALID', detail: String(f.path) };
    const prior = claims.find(c => pathsOverlap(c.path, n));
    if (prior) { if (f.mode === 'exclusive') prior.mode = 'exclusive'; if (prior.path.length > n.length) prior.path = n; continue; }
    claims.push({ path: n, mode: f.mode });
  }
  const base = { id: assignment.id, owner: assignment.owner, worker: assignment.worker, provider: assignment.provider, branch: assignment.branch ?? null, state: 'reserved', reservedAt: t, heartbeatAt: t, files: claims };
  if (!Number.isInteger(capacity) || capacity < 1) return { ok: false, code: 'CAPACITY_UNKNOWN', detail: 'allocatable provider capacity is required to reserve a slot' };

  let slot = null;
  for (let i = 1; i <= capacity && slot === null; i++) {
    if (backend.acquire([[slotKey(assignment.provider, i), { ...base, kind: 'slot', slot: i }]], token).ok) slot = i;
  }
  if (slot === null) return { ok: false, code: 'NO_CAPACITY', detail: `all ${capacity} allocatable ${assignment.provider} slots are reserved` };
  const slotK = slotKey(assignment.provider, slot);
  const entries = [[workKey(assignment.id), { ...base, kind: 'work', slot }]];
  if (nonEmpty(assignment.branch)) entries.push([branchKey(assignment.branch), { ...base, kind: 'branch', slot }]);
  if (nonEmpty(assignment.workKey)) entries.push([workItemKey(assignment.workKey), { ...base, kind: 'workkey', slot }]);
  for (const c of claims) entries.push([fileKey(c.path, assignment.id), { ...base, kind: 'file-claim', path: c.path, mode: c.mode, slot }]);
  const keys = [slotK, ...entries.map(e => e[0])];
  const r = backend.acquire(entries, token);
  if (!r.ok) { backend.release([slotK], token); return { ok: false, code: 'RESERVATION_FAILED', detail: r.error, conflictKey: r.conflictKey }; }
  const conflicts = conflictsFor(backend.list(), assignment.id, claims);
  if (conflicts.length) { backend.release(keys, token); return { ok: false, code: 'FILE_CONFLICT', detail: `conflicting claim by ${[...new Set(conflicts.map(c => c.other))].join(', ')} on ${[...new Set(conflicts.map(c => c.path))].join(', ')}`, conflictKey: null }; }
  return { ok: true, token, keys, slot };
}

/**
 * The controlled pathway: validate -> reserve -> run the launch command. The command is never
 * started unless both succeed. If the command fails to start/exits nonzero the reservation is released.
 */
export function dispatch(assignment, state, backend, command, opts = {}) {
  const verdict = validateAssignment(assignment, state, opts);
  if (verdict.decision !== 'ACCEPTED') return { ...verdict, launched: false };
  // A reservation whose provider state was verified dead is released here by compare-and-swap on its token, then re-taken atomically below.
  for (const rc of verdict.reclaims ?? []) {
    const ks = [workKey(rc.id), ...(rc.files ?? []).map(f => normalizePath(f.path)).filter(Boolean).map(p => fileKey(p, rc.id))];
    if (rc.provider && rc.slot) ks.push(slotKey(rc.provider, rc.slot));
    backend.release(ks, rc.token); // compare-and-swap on the dead reservation's token: a newer live reservation is never touched
  }
  const res = reserve(backend, assignment, { ...opts, capacity: allocatable(state.providers[assignment.provider]) });
  if (!res.ok) return { ...verdict, decision: 'REJECTED', reasons: [{ decision: 'REJECTED', code: res.code ?? 'RESERVATION_FAILED', detail: `could not take ownership (${res.detail ?? res.conflictKey})` }], launched: false };
  if (!Array.isArray(command) || command.length === 0) return { ...verdict, reservation: res, launched: false, note: 'reserved only (no launch command)' };
  const run = spawnSync(command[0], command.slice(1), { encoding: 'utf8' });
  if (run.status !== 0) { backend.release(res.keys, res.token); return { ...verdict, decision: 'BLOCKED', reasons: [{ decision: 'BLOCKED', code: 'LAUNCH_FAILED', detail: `command exited ${run.status}; reservation released` }], launched: false }; }
  return { ...verdict, reservation: res, launched: true };
}

/** Detect work that exists on GitHub without a reservation (bypass detection; read-only). */
export function auditUnreserved(state, backend) {
  const reserved = backend.list().filter(r => r.kind === 'work');
  const ids = new Set(reserved.map(r => r.id));
  const branches = new Set(reserved.map(r => r.branch).filter(Boolean));
  const offenders = (state.openPRs ?? []).filter(p => !ids.has(p.workId) && !branches.has(p.headRef)).map(p => ({ pr: p.number, headRef: p.headRef }));
  return { ok: offenders.length === 0, code: offenders.length ? 'UNRESERVED_WORK' : 'OK', reservations: reserved.length, unreserved: offenders };
}

function parseArgs(argv) { const o = { _: [] }; let i = 0; for (; i < argv.length; i++) { if (argv[i] === '--') { o.cmd = argv.slice(i + 1); break; } if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i]; else o._.push(argv[i]); } return o; }
const readJson = f => { try { return JSON.parse(fs.readFileSync(path.resolve(f), 'utf8')); } catch { return undefined; } };

function cli() {
  const o = parseArgs(process.argv.slice(2));
  const [sub] = o._;
  const backend = o['git-remote'] ? gitRefBackend(o['git-dir'] ?? process.cwd(), o['git-remote']) : (o.ledger ? localBackend(o.ledger) : null);
  const out = r => { process.stdout.write(JSON.stringify(r, null, 2) + '\n'); };
  let result;
  if (['check', 'reserve', 'dispatch'].includes(sub) && o.assignment) {
    const a = readJson(o.assignment);
    const state = o.state ? readJson(o.state) : undefined; // unreadable/missing state => BLOCKED
    if (a === undefined) { out({ decision: 'REJECTED', reasons: [{ code: 'MISSING_FIELD', detail: 'assignment file unreadable' }] }); process.exit(1); }
    if (sub === 'check') result = validateAssignment(a, state);
    else if (!backend) { process.stderr.write('reserve/dispatch need --ledger <dir> or --git-remote <name>\n'); process.exit(64); }
    else result = dispatch(a, state, backend, sub === 'dispatch' ? o.cmd : null);
    out(result);
    process.exit(result.decision === 'ACCEPTED' ? 0 : result.decision === 'BLOCKED' ? 2 : 1);
  } else if (sub === 'audit' && backend && o.state) {
    const state = readJson(o.state);
    if (!state) { out({ ok: false, code: 'STATE_UNAVAILABLE' }); process.exit(2); }
    result = auditUnreserved(state, backend); out(result); process.exit(result.ok ? 0 : 1);
  }
  process.stderr.write('Usage: dispatch-gate.mjs check --assignment a.json --state s.json\n       dispatch-gate.mjs reserve|dispatch --assignment a.json --state s.json (--ledger dir | --git-remote name) [-- launch command]\n       dispatch-gate.mjs audit --state s.json (--ledger dir | --git-remote name)\n');
  process.exit(64);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) cli();
