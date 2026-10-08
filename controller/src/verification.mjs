// Server-only verification orchestration. Vercel is never a test runner.
export const verificationChecks = Object.freeze({
 targeted: 'Cartilla targeted tests',
 worker: 'Cartilla worker checks',
 review: 'Cartilla independent review',
 release: 'Cartilla release verifier',
 browser: 'Cartilla browser proof',
 visual: 'Cartilla visual proof',
});
const shaPattern = /^[a-f0-9]{40}$/;
export function verificationRequirements(files) {
 const paths = files.map(f => typeof f === 'string' ? f : f.filename);
 const ui = paths.filter(p=>!/(^|\/)(__tests__|tests)\/|\.(test|spec)\./.test(p)).some(p => /^(src\/components\/|src\/pages\/|src\/styles\/|public\/)/.test(p) || /\.(tsx|jsx|css|scss|svg)$/.test(p));
 return {ui, visual: ui, checks: ['targeted','worker','review','release',...(ui?['browser','visual']:[])]};
}
export function verificationGate({head,main,verifiedMain,checks,files,appIds,implementationPassed,ownerGated=false}) {
 if(!shaPattern.test(head??'') || !shaPattern.test(main??'')) return {passed:false,reason:'INVALID_VERIFICATION_SHA'};
 if(ownerGated) return {passed:false,reason:'OWNER_APPROVAL_REQUIRED'};
 if(!implementationPassed) return {passed:false,reason:'IMPLEMENTATION_PROOF_REQUIRED'};
 if(verifiedMain!==main) return {passed:false,reason:'MAIN_CHANGED_REVERIFY'};
 if(!Array.isArray(appIds)||!appIds.length) return {passed:false,reason:'RELEASE_VERIFIER_NOT_CONNECTED'};
 const requirements=verificationRequirements(files);
 for(const key of requirements.checks) {
  const candidates=checks.filter(c=>c.name===verificationChecks[key] && appIds.includes(c.app_id??c.app?.id) && c.head_sha===head);
  // A later rerun invalidates an older pass, including a currently pending rerun.
  candidates.sort((a,b)=>new Date(b.started_at??b.completed_at??0)-new Date(a.started_at??a.completed_at??0) || Number(b.id??0)-Number(a.id??0));
  const check=candidates[0];
  if(!check) return {passed:false,reason:'PROOF_MISSING:'+key,head,requirements};
  if(check.status!=='completed') return {passed:false,reason:'PROOF_PENDING:'+key,head,requirements};
  if(check.conclusion!=='success') return {passed:false,reason:'PROOF_FAILED:'+key,head,requirements};
 }
 return {passed:true,head,main,requirements,deployment_required:false};
}
export function workerVerificationContract({ui=false}={}) {
 return ['Prove the changed behavior with targeted tests and publish exact commands/results.',
 'Run pnpm typecheck when relevant; run pnpm verify:worker for broader non-mutating checks.',
 ...(ui?['Run pnpm dev:worker and browser tests; publish representative screenshots for visible changes.']:[]),
 'Do not run pnpm build, pnpm dev, pnpm prepare:art or pnpm verify:release during ordinary implementation.',
 'Persist the implementation PR early. Independent review and clean exact-head release verification follow separately.',
 'No commit, PR, verification pass or merge requests a Vercel deployment.'];
}
export class VerificationPipeline {
 constructor({ledger,github,send,env=process.env}) { Object.assign(this,{ledger,github,send,env}); }
 async request(parent,evidence) {
  const head=evidence.pr.head;const main=await this.github.main();
  if(!shaPattern.test(head))throw Error('INVALID_VERIFICATION_SHA');
  const job=await this.ledger.create({key:`release:${parent.id}:${head}:${main.sha}`,kind:'reconcile',
   issue:parent.issue_number,source:{lane:'release_verifier',parent_job:parent.id,pr:evidence.pr.number,head,main:main.sha},
   spec:{action:'Independent clean-checkout pnpm verify:release; browser and visual proof when required',...verificationRequirements(evidence.files)}});
  await this.ledger.queue(job,this.send);
  return job;
 }
 async inspect(job) {
  const s=job.source;
  const pr=await this.github.request('/pulls/'+s.pr);
  const main=await this.github.main();
  if(pr.head.sha!==s.head)return {passed:false,reason:'PR_HEAD_CHANGED_REVERIFY'};
  if(main.sha!==s.main)return {passed:false,reason:'MAIN_CHANGED_REVERIFY'};
  const files=await this.github.pages('/pulls/'+s.pr+'/files');
  const checks=await this.github.pages('/commits/'+s.head+'/check-runs','check_runs');
  const ids=String(this.env.RELEASE_VERIFIER_APP_IDS??'').split(',').filter(Boolean).map(Number).filter(n=>Number.isSafeInteger(n)&&n>0);
  const labels=(pr.labels??[]).map(l=>l.name);
  const result=verificationGate({head:s.head,main:main.sha,verifiedMain:s.main,checks,files,appIds:ids,
   implementationPassed:true,ownerGated:labels.some(l=>['owner-gated','controller:blocked','SOURCE_BLOCKED'].includes(l))});
  const fresh=await this.github.request('/pulls/'+s.pr);
  if(fresh.head.sha!==s.head || (await this.github.main()).sha!==s.main)return {passed:false,reason:'STATE_CHANGED_DURING_VERIFICATION'};
  return {...result,pr:s.pr,checks:checks.filter(c=>ids.includes(c.app?.id)).map(c=>({id:c.id,name:c.name,head_sha:c.head_sha,status:c.status,conclusion:c.conclusion,app_id:c.app?.id,started_at:c.started_at,completed_at:c.completed_at}))};
 }
}
