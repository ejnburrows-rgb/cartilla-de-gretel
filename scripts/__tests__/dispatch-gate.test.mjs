import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileKey, slotKey, validateAssignment, localBackend, gitRefBackend, reserve, dispatch, auditUnreserved, RESERVATION_TTL_MS } from '../dispatch-gate.mjs';

const GATE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../dispatch-gate.mjs');
const NOW = Date.parse('2026-10-19T12:00:00Z');
const MAIN = 'f'.repeat(40);
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'gate-'));
const ownerScope = (o = {}) => ({ status: 'approved', approvedBy: 'owner', channel: 'whatsapp', messageId: 'wamid.HBgLMTk1NDg3MjI3NjIVAgASGCBBQzkwRTc3ODU1QThDMjg2', receivedAt: '2025-01-01T00:00:00Z', quote: 'Yes, approved', ...o });
const assignment = (o = {}) => ({
  id: 'L3-pencil', requester: 'muse', owner: 'muse', worker: 'jules-lane-4', provider: 'jules', scopeRef: 'scope-2026-10-20-review',
  policyRevision: MAIN, gap: { requirement: 'Pencil rules (#908)', evidenceRef: 'https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/908' },
  instructionRefs: ['AGENTS.md@' + MAIN], acceptance: [{ kind: 'command', ref: 'pnpm vitest run src/cartilla/interactions' }],
  dependsOn: [], files: [{ path: 'src/cartilla/interactions/PencilConnector.tsx', mode: 'exclusive' }], reuse: { checked: true, refs: ['#930'], considered: [] }, ...o,
});
const state = (o = {}) => ({
  capturedAt: new Date(NOW - 60000).toISOString(), mainSha: MAIN,
  authorizations: { 'scope-2026-10-20-review': ownerScope() },
  providers: { jules: { available: true, totalSlots: 15, externalBusy: 12 } },
  workItems: { 'L3-base': { state: 'done' }, 'L3-wait': { state: 'in_progress' } },
  reservations: [], openPRs: [], fileOwnership: {}, ...o,
});
const codes = r => r.reasons.map(x => x.code);
const check = (a, s) => validateAssignment(a, s, { now: NOW });

// ---------------- positive ----------------
test('valid assignment is accepted', () => { const r = check(assignment(), state()); assert.equal(r.decision, 'ACCEPTED'); assert.deepEqual(r.reasons, []); });
test('independent unrelated work continues while another lane is reserved', () => {
  const held = { id: 'other', owner: 'muse', state: 'running', heartbeatAt: new Date(NOW - 1000).toISOString(), files: [{ path: 'src/other.ts', mode: 'exclusive' }] };
  assert.equal(check(assignment(), state({ reservations: [held] })).decision, 'ACCEPTED');
});
test('shared dependency on an open PR proceeds only when reuse decision names the PR', () => {
  const s = state({ openPRs: [{ number: 921, headRef: 'motion/x', files: ['src/cartilla/interactions/PencilConnector.tsx'] }] });
  assert.ok(codes(check(assignment(), s)).includes('REUSE_NOT_ADDRESSED'));
  const a = assignment({ reuse: { checked: true, refs: ['#921'], considered: [921] } });
  const r = check(a, s); assert.equal(r.decision, 'ACCEPTED'); assert.equal(r.files[0].class, 'shared_dependency');
});

// ---------------- negative: each must reject ----------------
test('missing fields are rejected', () => { const r = check({}, state()); assert.equal(r.decision, 'REJECTED'); assert.ok(codes(r).includes('MISSING_FIELD')); });
test('untestable acceptance rejected', () => assert.ok(codes(check(assignment({ acceptance: [{ kind: 'vibes', ref: '' }] }), state())).includes('ACCEPTANCE_NOT_TESTABLE')));
test('assignment from anyone but Muse is rejected', () => assert.ok(codes(check(assignment({ requester: 'instinct' }), state())).includes('UNAUTHORIZED_DISPATCHER')));
test('Antigravity provider is denied', () => assert.ok(codes(check(assignment({ provider: 'antigravity' }), state({ providers: { antigravity: { available: true, totalSlots: 5, externalBusy: 0 } } }))).includes('PROVIDER_DENIED')));
test('no state snapshot is BLOCKED, never accepted', () => { const r = check(assignment(), undefined); assert.equal(r.decision, 'BLOCKED'); assert.ok(codes(r).includes('STATE_UNAVAILABLE')); });
test('stale state snapshot is BLOCKED', () => assert.ok(codes(check(assignment(), state({ capturedAt: new Date(NOW - 3600000).toISOString() }))).includes('STATE_STALE')));
test('outdated policy revision rejected', () => assert.ok(codes(check(assignment({ policyRevision: '0'.repeat(40) }), state())).includes('STALE_POLICY_REVISION')));
test('unknown authorization is BLOCKED', () => { const r = check(assignment({ scopeRef: 'nope' }), state()); assert.equal(r.decision, 'BLOCKED'); assert.ok(codes(r).includes('UNKNOWN_AUTHORIZATION')); });
test('unapproved scope rejected', () => assert.ok(codes(check(assignment(), state({ authorizations: { 'scope-2026-10-20-review': ownerScope({ status: 'pending' }) } }))).includes('SCOPE_UNAUTHORIZED')));
test('agent-approved scope rejected', () => assert.ok(codes(check(assignment(), state({ authorizations: { 'scope-2026-10-20-review': ownerScope({ approvedBy: 'muse' }) } }))).includes('SCOPE_UNAUTHORIZED')));
test('unverified provider capacity is BLOCKED', () => assert.equal(check(assignment(), state({ providers: {} })).decision, 'BLOCKED'));
test('unavailable provider capacity rejected', () => assert.ok(codes(check(assignment(), state({ providers: { jules: { available: true, totalSlots: 15, externalBusy: 15 } } }))).includes('PROVIDER_UNAVAILABLE')));
test('blocked dependency is BLOCKED', () => { const r = check(assignment({ dependsOn: ['L3-wait'] }), state()); assert.equal(r.decision, 'BLOCKED'); assert.ok(codes(r).includes('DEPENDENCY_UNSATISFIED')); });
test('unknown dependency is BLOCKED', () => assert.ok(codes(check(assignment({ dependsOn: ['ghost'] }), state())).includes('DEPENDENCY_UNKNOWN')));
test('satisfied dependency passes', () => assert.equal(check(assignment({ dependsOn: ['L3-base'] }), state()).decision, 'ACCEPTED'));
test('already-done work rejected', () => assert.ok(codes(check(assignment(), state({ workItems: { 'L3-pencil': { state: 'done' } } }))).includes('ALREADY_DONE')));
test('duplicate assignment id rejected', () => {
  const r = { id: 'L3-pencil', owner: 'jules-lane-2', state: 'running', heartbeatAt: new Date(NOW - 1000).toISOString(), files: [] };
  assert.ok(codes(check(assignment(), state({ reservations: [r] }))).includes('DUPLICATE_ASSIGNMENT'));
});
test('open PR already carrying the work rejects a duplicate', () => assert.ok(codes(check(assignment({ branch: 'lane/x' }), state({ openPRs: [{ number: 5, headRef: 'lane/x', files: [] }] }))).includes('DUPLICATE_ASSIGNMENT')));
test('conflicting exclusive file claims rejected', () => {
  const r = { id: 'rival', owner: 'jules-lane-9', state: 'running', heartbeatAt: new Date(NOW - 1000).toISOString(), files: [{ path: 'src/cartilla/interactions/PencilConnector.tsx', mode: 'exclusive' }] };
  const v = check(assignment(), state({ reservations: [r] })); assert.equal(v.decision, 'REJECTED'); assert.ok(codes(v).includes('FILE_CONFLICT_EXCLUSIVE')); assert.equal(v.files[0].class, 'exclusive_conflict');
});
test('uncertain file ownership blocks only that assignment', () => {
  const v = check(assignment(), state({ fileOwnership: { 'src/cartilla/interactions/PencilConnector.tsx': 'unknown' } })); assert.equal(v.decision, 'BLOCKED');
  assert.equal(check(assignment({ files: [{ path: 'src/clear.ts', mode: 'exclusive' }] }), state({ fileOwnership: { 'src/cartilla/interactions/PencilConnector.tsx': 'unknown' } })).decision, 'ACCEPTED');
});
test('stale reservation cannot silently authorize new work', () => {
  const old = new Date(NOW - RESERVATION_TTL_MS - 1000).toISOString();
  const r = { id: 'L3-pencil', owner: 'jules-lane-2', state: 'running', heartbeatAt: old, token: 'tok-old', provider: 'jules', files: [] };
  const v = check(assignment(), state({ reservations: [r] })); assert.equal(v.decision, 'REJECTED'); assert.ok(codes(v).includes('STALE_RESERVATION'));
  // only after the real provider state is verified dead is the work reassignable (then it is no longer 'stale', it is a plain duplicate-free claim)
  const dead = check(assignment(), state({ reservations: [r], providerVerifiedDead: [{ id: 'L3-pencil', token: 'tok-old' }] })); assert.equal(dead.decision, 'ACCEPTED'); assert.deepEqual(dead.reclaims.map(x => x.id), ['L3-pencil']);
  // reclaim re-takes ownership atomically through dispatch, by compare-and-swap on the dead reservation's token
  const d = tmp(); const be = localBackend(path.join(d, 'l')); const first = reserve(be, assignment(), { capacity: 3 }); assert.equal(first.ok, true);
  const live = be.list().find(x => x.kind === 'work');
  const rr = { ...r, token: first.token, provider: 'jules', slot: first.slot, files: [{ path: 'src/cartilla/interactions/PencilConnector.tsx', mode: 'exclusive' }] };
  const out = dispatch(assignment(), { ...state({ reservations: [rr], providerVerifiedDead: [{ id: 'L3-pencil', token: first.token }] }), capturedAt: new Date().toISOString() }, be, null);
  assert.equal(out.decision, 'ACCEPTED'); assert.equal(live.token, first.token); assert.notEqual(be.list().find(x => x.kind === 'work').token, first.token);
});

// ---------------- race safety ----------------
const runCli = (args) => new Promise(res => { const p = spawn(process.execPath, [GATE, ...args], { stdio: ['ignore', 'pipe', 'pipe'] }); let out = ''; p.stdout.on('data', d => (out += d)); p.on('close', code => res({ code, out })); });
function writeInputs(dir, a, s) {
  fs.writeFileSync(path.join(dir, 'a.json'), JSON.stringify(a)); fs.writeFileSync(path.join(dir, 'a2.json'), JSON.stringify(a));
  fs.writeFileSync(path.join(dir, 's.json'), JSON.stringify({ ...s, capturedAt: new Date().toISOString() }));
}
test('8 simultaneous identical requests: exactly one is authorized (local ledger)', async () => {
  const d = tmp(); writeInputs(d, assignment(), state());
  const rs = await Promise.all(Array.from({ length: 8 }, () => runCli(['reserve', '--assignment', path.join(d, 'a.json'), '--state', path.join(d, 's.json'), '--ledger', path.join(d, 'ledger')])));
  assert.equal(rs.filter(r => r.code === 0).length, 1, rs.map(r => r.code).join(','));
  assert.equal(rs.filter(r => r.code === 1).length, 7);
});
test('simultaneous requests for DIFFERENT work with the same exclusive file: one wins, loser holds no stray locks', async () => {
  const d = tmp(); const s = state(); writeInputs(d, assignment(), s);
  fs.writeFileSync(path.join(d, 'b.json'), JSON.stringify(assignment({ id: 'L3-other', files: [{ path: 'src/free.ts', mode: 'exclusive' }, { path: 'src/cartilla/interactions/PencilConnector.tsx', mode: 'exclusive' }] })));
  const args = f => ['reserve', '--assignment', path.join(d, f), '--state', path.join(d, 's.json'), '--ledger', path.join(d, 'ledger')];
  const rs = await Promise.all([runCli(args('a.json')), runCli(args('b.json')), runCli(args('a.json')), runCli(args('b.json'))]);
  assert.ok(rs.filter(r => r.code === 0).length <= 1, rs.map(r => r.code).join(','));
  const be = localBackend(path.join(d, 'ledger')); const ids = new Set(be.list().map(r => r.id));
  assert.ok(ids.size <= 1); // at most one winner; loser's partial locks rolled back
  if (ids.has('L3-pencil')) assert.equal(be.list().some(r => r.path === 'src/free.ts'), false);
});
test('8 simultaneous requests against a shared git remote: exactly one is authorized (git-ref backend, real git, local bare remote)', async () => {
  const d = tmp(); const bare = path.join(d, 'remote.git'); const work = path.join(d, 'work');
  spawnSync('git', ['init', '-q', '--bare', bare]); spawnSync('git', ['init', '-q', work]);
  writeInputs(d, assignment(), state());
  const rs = await Promise.all(Array.from({ length: 8 }, () => runCli(['reserve', '--assignment', path.join(d, 'a.json'), '--state', path.join(d, 's.json'), '--git-remote', bare, '--git-dir', work])));
  assert.equal(rs.filter(r => r.code === 0).length, 1, rs.map(r => r.code).join(','));
  const be = gitRefBackend(work, bare); assert.equal(be.list().filter(r => r.id === 'L3-pencil').length >= 1, true);
  // release by wrong token does nothing, right token frees
  const first = be.list().find(x => x.kind === 'work'); be.release(['work-L3-pencil'], 'wrong-token'); assert.equal(be.list().some(r => r.id === 'L3-pencil'), true);
  const keys = ['work-L3-pencil', fileKey('src/cartilla/interactions/PencilConnector.tsx', 'L3-pencil'), slotKey('jules', first.slot)];
  be.release(keys, first.token); assert.equal(be.list().length, 0);
});

// ---------------- controlled pathway / bypass ----------------
test('dispatch launches the worker only through an accepted, reserved assignment', () => {
  const d = tmp(); const marker = path.join(d, 'launched'); const be = localBackend(path.join(d, 'l'));
  const cmd = [process.execPath, '-e', `require('fs').writeFileSync(${JSON.stringify(marker)},'x')`];
  const ok = dispatch(assignment(), { ...state(), capturedAt: new Date().toISOString() }, be, cmd);
  assert.equal(ok.launched, true); assert.equal(fs.existsSync(marker), true);
});
test('BYPASS ATTEMPTS through the controlled pathway never start the worker', () => {
  const d = tmp(); const marker = path.join(d, 'launched'); const cmd = [process.execPath, '-e', `require('fs').writeFileSync(${JSON.stringify(marker)},'x')`];
  const fresh = (o = {}) => ({ ...state(o), capturedAt: new Date().toISOString() });
  const attempts = {
    'no state': [assignment(), undefined],
    'wrong dispatcher': [assignment({ requester: 'instinct' }), fresh()],
    'unauthorized scope': [assignment(), fresh({ authorizations: {} })],
    'denied provider': [assignment({ provider: 'antigravity' }), fresh({ providers: { antigravity: { available: true, totalSlots: 1, externalBusy: 0 } } })],
    'unmet dependency': [assignment({ dependsOn: ['L3-wait'] }), fresh()],
    'missing acceptance': [assignment({ acceptance: [] }), fresh()],
  };
  for (const [name, [a, s]] of Object.entries(attempts)) {
    const r = dispatch(a, s, localBackend(path.join(d, 'l-' + name.replace(/ /g, '-'))), cmd);
    assert.equal(r.launched, false, name); assert.notEqual(r.decision, 'ACCEPTED', name); assert.equal(fs.existsSync(marker), false, name);
  }
});
test('a failed reservation cannot start a worker', () => {
  const d = tmp(); const marker = path.join(d, 'launched'); const be = localBackend(path.join(d, 'l')); const cmd = [process.execPath, '-e', `require('fs').writeFileSync(${JSON.stringify(marker)},'x')`];
  const s = { ...state(), capturedAt: new Date().toISOString() };
  assert.equal(reserve(be, assignment(), { capacity: 3 }).ok, true); // a concurrent claim not yet visible in the snapshot
  const r = dispatch(assignment(), s, be, cmd); assert.equal(r.launched, false); assert.equal(r.reasons[0].code, 'RESERVATION_FAILED'); assert.equal(fs.existsSync(marker), false);
});
test('launch failure releases the reservation', () => {
  const d = tmp(); const be = localBackend(path.join(d, 'l'));
  const r = dispatch(assignment(), { ...state(), capturedAt: new Date().toISOString() }, be, [process.execPath, '-e', 'process.exit(3)']);
  assert.equal(r.launched, false); assert.equal(be.list().length, 0);
});
test('CLI exit codes: accepted 0, rejected 1, blocked 2, usage 64', () => {
  const d = tmp(); writeInputs(d, assignment(), state()); const a = path.join(d, 'a.json'), s = path.join(d, 's.json');
  assert.equal(spawnSync(process.execPath, [GATE, 'check', '--assignment', a, '--state', s]).status, 0);
  fs.writeFileSync(path.join(d, 'bad.json'), JSON.stringify(assignment({ requester: 'chatgpt' })));
  assert.equal(spawnSync(process.execPath, [GATE, 'check', '--assignment', path.join(d, 'bad.json'), '--state', s]).status, 1);
  assert.equal(spawnSync(process.execPath, [GATE, 'check', '--assignment', a, '--state', path.join(d, 'missing.json')]).status, 2);
  assert.equal(spawnSync(process.execPath, [GATE]).status, 64);
});
test('audit detects work that bypassed reservation', () => {
  const d = tmp(); const be = localBackend(path.join(d, 'l')); reserve(be, assignment({ branch: 'lane/ok' }), { capacity: 3 });
  const r = auditUnreserved(state({ openPRs: [{ number: 1, headRef: 'lane/ok', files: [] }, { number: 2, headRef: 'jules-123', files: [] }] }), be);
  assert.equal(r.ok, false); assert.deepEqual(r.unreserved.map(x => x.pr), [2]);
});


// ---------------- reviewer findings: fail closed, normalization, capacity, CAS ----------------
const NOWR = () => ({ capturedAt: new Date().toISOString() });
const freshState = o => ({ ...state(o), ...NOWR() });
test('FINDING 1: each missing state section is BLOCKED, never treated as empty', () => {
  for (const k of ['openPRs', 'reservations', 'fileOwnership', 'workItems', 'authorizations', 'providers']) {
    const s = freshState(); delete s[k];
    const v = validateAssignment(assignment(), s);
    assert.equal(v.decision, 'BLOCKED', k); assert.ok(codes(v).includes('STATE_INCOMPLETE'), k);
  }
  const wrongType = freshState({ openPRs: {} }); assert.equal(validateAssignment(assignment(), wrongType).decision, 'BLOCKED');
});
test('FINDING 2: a shared claim cannot be accepted over another worker\'s exclusive file (validate and reserve)', () => {
  const heldFile = { path: 'src/cartilla/interactions/PencilConnector.tsx', mode: 'exclusive' };
  const r = { id: 'rival', owner: 'jules-lane-9', state: 'running', heartbeatAt: new Date().toISOString(), token: 't', files: [heldFile] };
  const sharedAssignment = assignment({ files: [{ path: heldFile.path, mode: 'shared' }] });
  const v = validateAssignment(sharedAssignment, freshState({ reservations: [r] }));
  assert.equal(v.decision, 'REJECTED'); assert.ok(codes(v).includes('FILE_CONFLICT_EXCLUSIVE'));
  const be = localBackend(path.join(tmp(), 'l'));
  assert.equal(reserve(be, assignment({ id: 'holder' }), { capacity: 3 }).ok, true);
  const res = reserve(be, assignment({ id: 'sharer', files: [{ path: heldFile.path, mode: 'shared' }] }), { capacity: 3 });
  assert.equal(res.ok, false); assert.equal(res.code, 'FILE_CONFLICT');
  assert.equal(be.list().some(x => x.id === 'sharer'), false); // rolled back completely, including its slot
});
test('FINDING 3: equivalent spellings of one path cannot both hold exclusive reservations', () => {
  const spellings = ['src/a.ts', 'src/./a.ts', 'SRC/A.ts', 'src\\a.ts', 'src/b/../a.ts', 'src//a.ts', 'src'];
  const be = localBackend(path.join(tmp(), 'l'));
  assert.equal(reserve(be, assignment({ id: 'w0', files: [{ path: 'src/a.ts', mode: 'exclusive' }] }), { capacity: 15 }).ok, true);
  spellings.slice(1).forEach((p, i) => { const r = reserve(be, assignment({ id: 'w' + (i + 1), files: [{ path: p, mode: 'exclusive' }] }), { capacity: 15 }); assert.equal(r.ok, false, p); });
  assert.equal(new Set(be.list().filter(x => x.kind === 'work').map(x => x.id)).size, 1);
  const holder = { id: 'w0', owner: 'x', state: 'running', heartbeatAt: new Date().toISOString(), token: 't', files: [{ path: 'src/a.ts', mode: 'exclusive' }] };
  for (const p of spellings.slice(1)) assert.equal(validateAssignment(assignment({ id: 'n-' + p, files: [{ path: p, mode: 'exclusive' }] }), freshState({ reservations: [holder] })).decision, 'REJECTED', p);
  for (const bad of ['../x.ts', '/etc/passwd', 'a/../../b', 'C:\\x', '']) assert.ok(codes(validateAssignment(assignment({ files: [{ path: bad, mode: 'exclusive' }] }), freshState())).some(c => ['PATH_INVALID', 'FILES_UNDECLARED'].includes(c)), bad);
});
test('FINDING 3b: open-PR overlap detection also normalizes paths and directories', () => {
  const s = freshState({ openPRs: [{ number: 9, headRef: 'x', files: ['SRC\\Cartilla\\interactions\\PencilConnector.tsx'] }] });
  assert.ok(codes(validateAssignment(assignment(), s)).includes('REUSE_NOT_ADDRESSED'));
  assert.ok(codes(validateAssignment(assignment({ files: [{ path: 'src/cartilla', mode: 'exclusive' }] }), s)).includes('REUSE_NOT_ADDRESSED'));
});
test('FINDING 4: two independent reservations with one free slot: exactly one succeeds, slot freed on release', () => {
  const be = localBackend(path.join(tmp(), 'l'));
  const a1 = assignment({ id: 'cap-1', files: [{ path: 'src/one.ts', mode: 'exclusive' }] });
  const a2 = assignment({ id: 'cap-2', files: [{ path: 'src/two.ts', mode: 'exclusive' }] });
  const r1 = reserve(be, a1, { capacity: 1 }); const r2 = reserve(be, a2, { capacity: 1 });
  assert.equal(r1.ok, true); assert.equal(r2.ok, false); assert.equal(r2.code, 'NO_CAPACITY');
  be.release(r1.keys, r1.token); assert.equal(reserve(be, a2, { capacity: 1 }).ok, true);
  assert.equal(reserve(localBackend(path.join(tmp(), 'z')), a1, {}).ok, false); // unknown capacity never reserves
});
test('FINDING 4b: 6 simultaneous independent requests, 2 allocatable slots: at most 2 authorized (separate processes)', async () => {
  const d = tmp(); const s = freshState({ providers: { jules: { available: true, totalSlots: 15, externalBusy: 13 } } });
  fs.writeFileSync(path.join(d, 's.json'), JSON.stringify(s));
  const args = [];
  for (let i = 0; i < 6; i++) { fs.writeFileSync(path.join(d, `a${i}.json`), JSON.stringify(assignment({ id: 'ind-' + i, files: [{ path: `src/f${i}.ts`, mode: 'exclusive' }] }))); args.push(['reserve', '--assignment', path.join(d, `a${i}.json`), '--state', path.join(d, 's.json'), '--ledger', path.join(d, 'ledger')]); }
  const rs = await Promise.all(args.map(runCli));
  assert.equal(rs.filter(r => r.code === 0).length, 2, rs.map(r => r.code).join(','));
});
test('FINDING 5: fabricated owner approval provenance is rejected for scope authorization', () => {
  for (const bad of [{ messageId: 'invented' }, { messageId: 'wamid.short' }, { messageId: 'wamid.FAKEFAKEFAKEFAKEFAKEFAKE' }, { channel: 'email' }, { receivedAt: 'yesterday' }, { receivedAt: '2999-01-01T00:00:00Z' }, { quote: '' }, { approvedBy: 'muse' }]) {
    const v = validateAssignment(assignment(), freshState({ authorizations: { 'scope-2026-10-20-review': ownerScope(bad) } }));
    assert.equal(v.decision, 'REJECTED', JSON.stringify(bad)); assert.ok(codes(v).includes('SCOPE_UNAUTHORIZED'));
  }
});
test('FINDING 6: reclaim is compare-and-swap on the token: a stale snapshot cannot delete a NEW live reservation', () => {
  const d = tmp(); const be = localBackend(path.join(d, 'l'));
  const old = reserve(be, assignment(), { capacity: 3 }); assert.equal(old.ok, true);
  be.release(old.keys, old.token); // the old reservation really ended
  const fresh = reserve(be, assignment(), { capacity: 3 }); assert.equal(fresh.ok, true); // NEW live reservation for the same work
  const staleView = { id: 'L3-pencil', owner: 'muse', state: 'running', heartbeatAt: new Date(Date.now() - RESERVATION_TTL_MS - 5000).toISOString(), token: old.token, provider: 'jules', slot: old.slot, files: [{ path: 'src/cartilla/interactions/PencilConnector.tsx', mode: 'exclusive' }] };
  const out = dispatch(assignment(), freshState({ reservations: [staleView], providerVerifiedDead: [{ id: 'L3-pencil', token: old.token }] }), be, null);
  assert.equal(out.launched, false); assert.notEqual(out.decision, 'ACCEPTED');
  assert.equal(be.list().find(x => x.kind === 'work').token, fresh.token); // live reservation untouched
  // a dead-verification that names a different token does not authorize reclaim at all
  const wrong = validateAssignment(assignment(), freshState({ reservations: [staleView], providerVerifiedDead: [{ id: 'L3-pencil', token: 'other' }] }));
  assert.ok(codes(wrong).includes('STALE_RESERVATION'));
});
test('EXTRA: duplicate branch / workKey is rejected by the ledger even if the snapshot misses it', () => {
  const be = localBackend(path.join(tmp(), 'l'));
  assert.equal(reserve(be, assignment({ id: 'x1', branch: 'lane/dup', workKey: 'k-1', files: [{ path: 'src/x1.ts', mode: 'exclusive' }] }), { capacity: 15 }).ok, true);
  assert.equal(reserve(be, assignment({ id: 'x2', branch: 'lane/dup', files: [{ path: 'src/x2.ts', mode: 'exclusive' }] }), { capacity: 15 }).ok, false);
  assert.equal(reserve(be, assignment({ id: 'x3', workKey: 'k-1', files: [{ path: 'src/x3.ts', mode: 'exclusive' }] }), { capacity: 15 }).ok, false);
});
