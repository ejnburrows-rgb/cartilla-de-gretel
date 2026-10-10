/**
 * Small, dependency-free policy consistency and merge-evidence check.
 * Advisory: it does NOT install a GitHub branch-protection rule or run tests.
 * Call with --docs (from repo root) or --evidence path/to/receipt.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const POLICY_FILES = ['AGENTS.md','PROJECT_SOURCE_OF_TRUTH.md','PROJECT_FINISH_DEFINITION.md','tasks/plan.md'];

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

const documentationPath = f => typeof f==='string' && (/\.(md|mdx|txt)$/i.test(f) || /^docs\//i.test(f));

export function assessMerge(receipt) {
  const r=receipt && typeof receipt==='object'? receipt:{};
  const errors=[], advisories=[];
  const files=Array.isArray(r.changedFiles)?r.changedFiles:[];
  const docsOnly=files.length>0 && files.every(documentationPath);
  if (files.length===0) errors.push('No material changed files (empty PR is not completion)');
  if (r.headMatches!==true) errors.push('Current PR head not reconciled with verified revision');
  if (r.scopeAuthorized!==true) errors.push('Scope or merge authorization not confirmed');
  if (r.reviewed!==true) errors.push('Independent controller review of material diff is missing');
  if (r.ownerGateSatisfied!==true) errors.push('Owner-only decision or approval remains unresolved');
  if (Array.isArray(r.seriousDefects) && r.seriousDefects.length) errors.push('Confirmed serious defect is unresolved');
  if (!Array.isArray(r.seriousDefects)) errors.push('Confirmed defect review is missing');
  if (!docsOnly && (r.tests?.status!=='pass' || r.tests?.headMatches!==true)) errors.push('Applicable Jules test evidence absent, failed, or invalidated');
  if (r.uiRequired===true && r.uiEvidence!==true) errors.push('Required real UI/browser proof is absent');
  if (r.uiRequired!==true && r.uiRequired!==false) errors.push('UI proof applicability not assessed');
  if (r.sonar==='failure' || r.sonar==='unavailable' || r.sonar==='pending') advisories.push(`SonarCloud is advisory: ${r.sonar}`);
  return {ok:errors.length===0,errors,advisories};
}

function cli() {
  const [flag,arg]=process.argv.slice(2);
  let result;
  if (flag==='--docs' && !arg) {
    const docs=Object.fromEntries(POLICY_FILES.map(name=>[name,fs.existsSync(name)?fs.readFileSync(name,'utf8'):'']));
    result=validatePolicy(docs);
  } else if (flag==='--evidence' && arg) {
    result=assessMerge(JSON.parse(fs.readFileSync(path.resolve(arg),'utf8')));
  } else {
    process.stderr.write('Usage: node scripts/check-merge-policy.mjs --docs | --evidence <receipt.json>\n');
    process.exitCode=2; return;
  }
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if (!result.ok) process.exitCode=1;
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) cli();
