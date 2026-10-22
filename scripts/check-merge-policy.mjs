/**
 * Dependency-free policy consistency, completion-evidence and merge-readiness checks.
 * Local decision check: it does NOT install a GitHub branch-protection rule or run tests, so it
 * cannot stop an actor who merges on GitHub directly. Failing results exit nonzero.
 * Call with --docs, --evidence receipt.json (merge readiness) or --completion claim.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const POLICY_FILES = ['AGENTS.md','PROJECT_SOURCE_OF_TRUTH.md','PROJECT_FINISH_DEFINITION.md','tasks/plan.md'];


/** Normalize a repo path for comparison: slashes, ./, .., case, duplicate separators. Returns null if invalid or escaping the repo. */
export function normalizePath(p) {
  if (typeof p !== 'string') return null;
  let x = p.trim().replace(/\\/g, '/').replace(/\/+/g, '/');
  if (!x || x.startsWith('/') || /^[A-Za-z]:/.test(x) || x.includes('\0')) return null;
  const out = [];
  for (const seg of x.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { if (!out.length) return null; out.pop(); continue; }
    out.push(seg);
  }
  if (!out.length) return null;
  return out.join('/').toLowerCase();
}
/** Two claimed paths overlap when equal or one contains the other (a path may be a directory). */
export const pathsOverlap = (a, b) => a === b || b.startsWith(a + '/') || a.startsWith(b + '/');

const FAKE_WORDS = /(invent|fake|test|dummy|placeholder|example|sample|todo|tbd|lorem|xxx|mock)/i;
const CHANNEL_ID = {
  whatsapp: /^wamid\.[A-Za-z0-9+/=_-]{20,}$/,
  imessage: /^[A-Za-z0-9._:-]{20,}$/,
  sms: /^[A-Za-z0-9._:-]{20,}$/,
};
/**
 * Structural provenance check for an owner message reference. It proves the record is well formed
 * and time-ordered, NOT that the message is real: authenticity must still be confirmed against the
 * owner's own channel by whoever presents the approval.
 */
export function validateOwnerMessage(ap, { now = Date.now(), notBefore } = {}) {
  const errors = [];
  if (!ap || typeof ap !== 'object') return ['OWNER_APPROVAL_MISSING: no owner approval record'];
  if (ap.approvedBy !== 'owner') errors.push('OWNER_APPROVAL_INVALID: approvedBy must be owner');
  const idRe = CHANNEL_ID[ap.channel];
  if (!idRe) errors.push('OWNER_APPROVAL_INVALID: channel must be whatsapp, imessage or sms');
  else if (typeof ap.messageId !== 'string' || !idRe.test(ap.messageId) || FAKE_WORDS.test(ap.messageId)) errors.push('OWNER_APPROVAL_PROVENANCE_INVALID: messageId is not a well-formed channel message id');
  const t = Date.parse(ap.receivedAt);
  if (!ap.receivedAt || Number.isNaN(t)) errors.push('OWNER_APPROVAL_PROVENANCE_INVALID: receivedAt must be an ISO timestamp');
  else {
    if (t > now + 60000) errors.push('OWNER_APPROVAL_PROVENANCE_INVALID: receivedAt is in the future');
    if (notBefore !== undefined && t < Date.parse(notBefore)) errors.push('OWNER_APPROVAL_PREDATES_HEAD: approval was given before the head commit existed');
  }
  if (typeof ap.quote !== 'string' || ap.quote.trim().length < 2) errors.push('OWNER_APPROVAL_PROVENANCE_INVALID: quote of the owner words is required');
  return errors;
}

export function validatePolicy(docs) {
  const errors = [];
  for (const name of POLICY_FILES) {
    const text = docs?.[name];
    if (typeof text !== 'string' || !text.trim()) { errors.push(`${name}: missing or empty`); continue; }
    if (!/sonar(?:cloud|qube)?/i.test(text) || !/(advisory|optional)/i.test(text) || !/non[- ]blocking/i.test(text)) {
      errors.push(`${name}: missing explicit Sonar advisory/non-blocking policy`);
    }
    if (/required\s+Sonar(?:Cloud|Qube)?\s+(?:review|gate|status)/i.test(text) ||
        /mandatory\s+.{0,80}Sonar(?:Cloud|Qube)?/i.test(text) ||
        /dual independent review.{0,160}Sonar(?:Cloud|Qube)?/i.test(text) ||
        /Sonar(?:Cloud|Qube)?\s+(?:must|shall)\s+pass/i.test(text)) {
      errors.push(`${name}: mandatory Sonar language conflicts with owner policy`);
    }
  }
  return {ok:errors.length===0,errors};
}

const CODE_EXT=/\.(m?js|cjs|jsx?|tsx?|py|sh|css|scss|json|html?|ya?ml|sql|toml)$/i;
const documentationPath = f => { const n=normalizePath(f); return n!==null && (/\.(md|mdx|txt)$/i.test(n) || (/^docs\//.test(n) && !CODE_EXT.test(n))); };

export function assessMerge(receipt) {
  const r=receipt && typeof receipt==='object'? receipt:{};
  const errors=[], advisories=[];
  const files=Array.isArray(r.changedFiles)?r.changedFiles:[];
  if (files.some(f=>normalizePath(f)===null)) errors.push('PATH_INVALID: changedFiles contains an invalid or repo-escaping path');
  const docsOnly=files.length>0 && files.every(documentationPath);
  if (files.length===0) errors.push('No material changed files (empty PR is not completion)');
  if (r.headMatches!==true) errors.push('Current PR head not reconciled with verified revision');
  if (r.scopeAuthorized!==true) errors.push('Scope or merge authorization not confirmed');
  if (r.reviewed!==true) errors.push('Independent controller review of material diff is missing');
  if (r.ownerGateSatisfied!==true) errors.push('Owner-only decision or approval remains unresolved');
  if (Array.isArray(r.seriousDefects) && r.seriousDefects.length) errors.push('Confirmed serious defect is unresolved');
  if (!Array.isArray(r.seriousDefects)) errors.push('Confirmed defect review is missing');
  if (!docsOnly && (r.tests?.status!=='pass' || r.tests?.headMatches!==true || !nonBlank(r.tests?.command) || !Number.isInteger(r.tests?.passed) || r.tests.passed<1 || r.tests?.failed!==0 || r.tests?.headSha!==r.currentHeadSha)) errors.push('Applicable test evidence absent, failed, or not tied to the current head (needs command, passed>0, failed=0, headSha)');
  if (r.uiRequired===true && r.uiEvidence!==true) errors.push('Required real UI/browser proof is absent');
  if (r.uiRequired!==true && r.uiRequired!==false) errors.push('UI proof applicability not assessed');
  // Owner approval must be bound to this exact PR and head SHA (a self-asserted boolean is not enough).
  const sha=/^[0-9a-f]{40}$/;
  if (!Number.isInteger(r.pr?.number) || !sha.test(r.headSha||'') || !sha.test(r.currentHeadSha||'')) errors.push('PR_IDENTITY_MISSING: pr.number, headSha and currentHeadSha (40-hex) are required');
  else if (r.headSha!==r.currentHeadSha) errors.push('STALE_HEAD: reviewed head is not the PR\'s current head; approval and proof are invalidated');
  const ap=r.ownerApproval;
  if (!ap || typeof ap!=='object') errors.push('OWNER_APPROVAL_MISSING: no owner approval record for this PR revision');
  else {
    for (const e of validateOwnerMessage(ap,{notBefore:r.headCommittedAt})) errors.push(e);
    if (!r.headCommittedAt || Number.isNaN(Date.parse(r.headCommittedAt))) errors.push('HEAD_TIME_MISSING: headCommittedAt (live data) is required to prove the approval came after the head');
    if (ap.prNumber!==r.pr?.number || ap.headSha!==r.currentHeadSha) errors.push('OWNER_APPROVAL_NOT_FOR_THIS_REVISION: approval names a different PR or head SHA');
  }
  if (r.sonar==='failure' || r.sonar==='unavailable' || r.sonar==='pending') advisories.push(`SonarCloud is advisory: ${r.sonar}`);
  return {ok:errors.length===0,errors,advisories};
}

const hex40=/^[0-9a-f]{40}$/;
const placeholderUrl=u=>!/^https:\/\//i.test(u||'') || /(example\.(com|org)|placeholder|localhost|\btbd\b|todo|lorem)/i.test(u);
const STAGES=['implemented','reviewed','approved','merged','deployed','verified'];

/**
 * Validate a completion claim against evidence. `claim` is what a worker reports; `actual` is what
 * the controller read from GitHub (live PR head and file list). Any mismatch or missing proof fails.
 */
export function assessCompletion(claim, actual) {
  const c=claim&&typeof claim==='object'?claim:{}; const act=actual&&typeof actual==='object'?actual:null;
  const errors=[];
  if (!act) return {ok:false,errors:['ACTUAL_STATE_UNAVAILABLE: no live PR/head data to check the claim against']};
  if (c.outcome==='INVESTIGATED_NO_CHANGE_REQUIRED') {
    if (!Array.isArray(c.evidenceRefs)||!c.evidenceRefs.length) errors.push('INVESTIGATION_EVIDENCE_MISSING: needs evidenceRefs');
    if (Array.isArray(c.changedFiles)&&c.changedFiles.length) errors.push('OUTCOME_MISMATCH: a no-change investigation cannot list changed files');
    return {ok:errors.length===0,errors,outcome:'INVESTIGATED_NO_CHANGE_REQUIRED',note:'valid investigation; NOT an implementation completion'};
  }
  if (c.outcome!=='IMPLEMENTED') return {ok:false,errors:['OUTCOME_UNKNOWN: outcome must be IMPLEMENTED or INVESTIGATED_NO_CHANGE_REQUIRED']};
  if (!Number.isInteger(c.pr)||c.pr!==act.pr) errors.push('PR_MISMATCH: claimed PR is not the PR checked');
  if (!hex40.test(c.headSha||'')) errors.push('HEAD_SHA_INVALID: 40-hex headSha required');
  else if (c.headSha!==act.headSha) errors.push('STALE_OR_WRONG_SHA: claimed head differs from the PR\'s actual head');
  const files=Array.isArray(c.changedFiles)?c.changedFiles:[];
  const actualFiles=Array.isArray(act.files)?act.files:[];
  if (!files.length) errors.push('NO_MATERIAL_CHANGE: empty implementation claim');
  else if (JSON.stringify([...files].sort())!==JSON.stringify([...actualFiles].sort())) errors.push('FILES_MISMATCH: claimed changed files differ from the PR\'s actual files');
  // Scope comes from the live reservation (ledger), never from the claimant. A claimant-supplied allowedPaths is ignored.
  const res=act.reservation;
  if (!res||!nonBlank(res.id)||!['reserved','running'].includes(res.state)||!Array.isArray(res.files)||!res.files.length) errors.push('RESERVATION_MISSING: actual.reservation (id, state, files) from the live ledger is required to check scope');
  else {
    if (c.assignmentId!==res.id) errors.push('ASSIGNMENT_MISMATCH: claim assignmentId is not the reservation id');
    const allowed=res.files.map(f=>normalizePath(f&&f.path));
    if (allowed.some(x=>x===null)||files.some(f=>{const n=normalizePath(f);return n===null||!allowed.some(p=>pathsOverlap(p,n)&&(n===p||n.startsWith(p+'/')));})) errors.push('SCOPE_VIOLATION: changed files outside the reserved paths (or invalid path)');
  }
  const docsOnly=files.length>0&&files.every(documentationPath);
  if (!docsOnly) {
    const t=c.tests;
    if (!t||!nonBlank(t.command)||!Number.isInteger(t.passed)||t.passed<1||t.failed!==0||t.headSha!==act.headSha) errors.push('TEST_EVIDENCE_INVALID: command, passed>0, failed=0 and the actual head SHA are required');
  }
  if (c.uiRequired===true) {
    const rp=c.renderProof;
    if (!rp||placeholderUrl(rp.url)||rp.headSha!==act.headSha||!['screenshot','video'].includes(rp.kind)) errors.push('RENDER_PROOF_INVALID: needs a real https screenshot/video URL for the actual head');
  } else if (c.uiRequired!==false) errors.push('UI_APPLICABILITY_NOT_ASSESSED');
  if (Array.isArray(c.seriousDefects)&&c.seriousDefects.length) errors.push('SERIOUS_DEFECT_UNRESOLVED');
  const stage=c.stage||'implemented';
  if (!STAGES.includes(stage)) errors.push('STAGE_UNKNOWN');
  const idx=STAGES.indexOf(stage);
  if (idx>=1&&!(c.review&&c.review.headSha===act.headSha)) errors.push('REVIEW_EVIDENCE_MISSING: stage reviewed+ needs a review of the actual head');
  if (idx>=2) { const ap=c.ownerApproval; const pe=validateOwnerMessage(ap,{notBefore:act.headCommittedAt}); if (!act.headCommittedAt||Number.isNaN(Date.parse(act.headCommittedAt))) pe.push('HEAD_TIME_MISSING: actual.headCommittedAt required'); if (!ap||ap.headSha!==act.headSha||ap.prNumber!==act.pr) pe.push('OWNER_APPROVAL_NOT_FOR_THIS_REVISION'); for (const e of pe) errors.push(e); }
  if (idx>=3&&!(act.mergedIntoMain===true&&hex40.test(c.mergeCommit||'')&&c.mergeCommit===act.mergeCommit)) errors.push('MERGE_EVIDENCE_MISSING: stage merged+ needs the real merge commit on main');
  if (idx>=4&&!(c.deployment&&!placeholderUrl(c.deployment.url)&&c.deployment.commit===act.mergeCommit)) errors.push('DEPLOY_EVIDENCE_MISSING: stage deployed+ needs a deployment URL for the merged commit');
  if (idx>=5&&!(c.verification&&Array.isArray(c.verification.checks)&&c.verification.checks.length)) errors.push('VERIFICATION_EVIDENCE_MISSING');
  return {ok:errors.length===0,errors,stage};
}
function nonBlank(v){return typeof v==='string'&&v.trim().length>0;}

function cli() {
  const [flag,arg]=process.argv.slice(2);
  let result;
  if (flag==='--docs' && !arg) {
    const docs=Object.fromEntries(POLICY_FILES.map(name=>[name,fs.existsSync(name)?fs.readFileSync(name,'utf8'):'']));
    result=validatePolicy(docs);
  } else if (flag==='--evidence' && arg) {
    result=assessMerge(JSON.parse(fs.readFileSync(path.resolve(arg),'utf8')));
  } else if (flag==='--completion' && arg) {
    const claim=JSON.parse(fs.readFileSync(path.resolve(arg),'utf8'));
    const actualPath=process.argv[4]==='--actual'?process.argv[5]:null;
    result=assessCompletion(claim, actualPath&&fs.existsSync(actualPath)?JSON.parse(fs.readFileSync(actualPath,'utf8')):null);
  } else {
    process.stderr.write('Usage: node scripts/check-merge-policy.mjs --docs | --evidence <receipt.json> | --completion <claim.json> --actual <actual.json>\n');
    process.exitCode=2; return;
  }
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if (!result.ok) process.exitCode=1;
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) cli();
