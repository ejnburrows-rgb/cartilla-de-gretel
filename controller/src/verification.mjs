import {transaction} from './db.mjs';
import {validateChange} from './policy.mjs';
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
export async function officialSonarHead(repo,number,head,fetcher=fetch){
 if(!/^[\w.-]+\/[\w.-]+$/.test(repo??'')||!Number.isSafeInteger(number)||number<1||!shaPattern.test(head??''))return false;
 const url='https://sonarcloud.io/api/project_pull_requests/list?project='+encodeURIComponent(repo.replace('/','_'));
 try{
  const response=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)return false;
  const body=await response.json();
  const rows=body?.pullRequests;
  if(!Array.isArray(rows))return false;
  const pr=rows.find(item=>item.key===String(number));
  return pr?.commit?.sha===head&&pr?.status?.qualityGateStatus==='OK'&&pr.status.bugs===0&&pr.status.vulnerabilities===0&&pr.status.codeSmells===0;
 }catch{return false;}
}

export function exactHeadSonarAudit(comments,check){
 const since=Date.parse(check?.started_at??'');
 if(!Number.isFinite(since))return null;
 return comments.find(c=>c.user?.login==='sonarqubecloud[bot]'&&Date.parse(c.updated_at??c.created_at??'')>=since&&/Quality Gate passed/i.test(c.body??'')&&/\b0 New issues\b/i.test(c.body??''))??null;
}

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
 constructor({ledger,github,send,env=process.env,sonarFetch=fetch}) { Object.assign(this,{ledger,github,send,env,sonarFetch}); }
 async request(parent,evidence) {
  const head=evidence.pr.head;const main=await this.github.main();
  if(!shaPattern.test(head))throw Error('INVALID_VERIFICATION_SHA');
  const job=await this.ledger.create({key:`release:${parent.id}:${head}:${main.sha}`,kind:'reconcile',
   issue:parent.issue_number,source:{lane:'release_verifier',parent_job:parent.id,pr:evidence.pr.number,head,main:main.sha},
   spec:{action:'Independent clean-checkout pnpm verify:release; browser and visual proof when required',files:[...new Set([...evidence.files.map(f=>typeof f==='string'?f:f.filename),...(parent.spec?.paths??[])])],...verificationRequirements(evidence.files)}});
  const ancestry=await this.github.request('/compare/'+main.sha+'...'+head);
  if(ancestry.status!=='ahead'){await this.ledger.set(job.id,'blocked','CURRENT_MAIN_RECONCILIATION_REQUIRED',{next_action:'Reconcile implementation branch with current main before paid verification',owner_action:'Nothing'});return this.ledger.get(job.id);}
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
  const execution=(await this.ledger.db.query("SELECT data FROM evidence_receipts WHERE job_id=$1 AND kind='independent_release_execution' ORDER BY recorded_at DESC LIMIT 1",[job.id])).rows[0]?.data;
  // Only controller-authenticated deterministic execution creates these receipts.
  if(job.status==='verified'&&execution?.passed===true&&execution.head===s.head&&execution.main===s.main){
   ids.push('controller-ledger');for(const key of execution.checks??[])checks.push({name:verificationChecks[key],head_sha:s.head,app_id:'controller-ledger',status:'completed',conclusion:'success'});
  }
  if(s.parent_job){const row=(await this.ledger.db.query("SELECT passed,details FROM validations WHERE job_id=$1 AND name='controller_independent_review' ORDER BY recorded_at DESC,passed ASC LIMIT 1",[s.parent_job])).rows[0];const review=row?.details;if(row?.passed===true&&review?.head===s.head&&review.main===s.main){ids.push('controller-review');checks.push({name:verificationChecks.review,head_sha:s.head,app_id:'controller-review',status:'completed',conclusion:'success'});}}
  const labels=(pr.labels??[]).map(l=>l.name);
  const result=verificationGate({head:s.head,main:main.sha,verifiedMain:s.main,checks,files,appIds:ids,
   implementationPassed:true,ownerGated:labels.some(l=>['owner-gated','controller:blocked','SOURCE_BLOCKED'].includes(l))});
  const fresh=await this.github.request('/pulls/'+s.pr);
  if(fresh.head.sha!==s.head || (await this.github.main()).sha!==s.main)return {passed:false,reason:'STATE_CHANGED_DURING_VERIFICATION'};
  return {...result,pr:s.pr,checks:checks.filter(c=>ids.includes(c.app?.id)).map(c=>({id:c.id,name:c.name,head_sha:c.head_sha,status:c.status,conclusion:c.conclusion,app_id:c.app?.id,started_at:c.started_at,completed_at:c.completed_at}))};
 }
 async merge(parent,release){
  const authorized=String(this.env.CONTROLLER_MERGE_ISSUES??'').split(',').map(Number);
  if(!authorized.includes(parent.issue_number))return {merged:false,reason:'MERGE_NOT_AUTHORIZED_FOR_ISSUE'};
  if(parent.status!=='verified'||release.status!=='verified'||release.source?.parent_job!==parent.id)return {merged:false,reason:'VERIFICATION_REQUIRED'};
  const gate=await this.inspect(release);if(!gate.passed)return {merged:false,reason:gate.reason};
  const material=await this.github.changes(parent);
  const proof=validateChange(parent,material,String(this.env.TRUSTED_CHECK_APP_IDS??'').split(',').filter(Boolean).map(Number));
  if(!proof.passed||material.pr?.head!==gate.head)return {merged:false,reason:'FRESH_MATERIAL_AND_TRUSTED_CHECKS_REQUIRED'};
  const issue=await this.github.request('/issues/'+parent.issue_number);
  if(issue.user?.login!==this.github.repo.split('/')[0]||issue.state!=='open'||(issue.labels??[]).some(l=>['owner-gated','controller:blocked','SOURCE_BLOCKED'].includes(l.name)))return {merged:false,reason:'CANONICAL_ISSUE_GATED'};
  let pr=await this.github.request('/pulls/'+release.source.pr);
  if(pr.merged)return {merged:true,sha:pr.merge_commit_sha,recovered:true};
  if(pr.draft&&pr.state==='open'&&pr.head.sha===gate.head&&typeof this.github.ready==='function'){await this.github.ready(pr.number);pr=await this.github.request('/pulls/'+pr.number);}
  if(pr.state!=='open'||pr.draft||pr.head.sha!==gate.head||pr.base.ref!=='main'||pr.head.repo?.full_name!==this.github.repo||pr.mergeable!==true)return {merged:false,reason:'PR_NOT_CURRENT_AND_MERGEABLE'};
  const reviews=await this.github.pages('/pulls/'+pr.number+'/reviews');const latest=new Map();for(const r of reviews)if(r.state!=='COMMENTED')latest.set(r.user?.login,r);
  if([...latest.values()].some(r=>r.state==='CHANGES_REQUESTED'))return {merged:false,reason:'CHANGES_REQUESTED'};
  const compare=await this.github.request('/compare/'+gate.main+'...'+gate.head);
  if(compare.status!=='ahead')return {merged:false,reason:'CURRENT_MAIN_RECONCILIATION_REQUIRED'};
  if((await this.github.main()).sha!==gate.main)return {merged:false,reason:'MAIN_CHANGED_REVERIFY'};
  // A verified release is not a substitute for the required public GitHub proof.
  const execution=(await this.ledger.db.query("SELECT data FROM evidence_receipts WHERE job_id=$1 AND kind='independent_release_execution' ORDER BY recorded_at DESC LIMIT 1",[release.id])).rows[0]?.data;
  if(execution?.passed!==true||execution.head!==gate.head||execution.main!==gate.main||!execution.checks?.includes('release'))return {merged:false,reason:'EXACT_HEAD_RELEASE_EVIDENCE_REQUIRED'};
  const reviewsReceipt=(await this.ledger.db.query("SELECT passed,details FROM validations WHERE job_id=$1 AND name='controller_independent_review' ORDER BY recorded_at DESC LIMIT 1",[parent.id])).rows[0];
  if(reviewsReceipt?.passed!==true||reviewsReceipt.details?.head!==gate.head||reviewsReceipt.details?.main!==gate.main)return {merged:false,reason:'CURRENT_INDEPENDENT_REVIEW_REQUIRED'};
  const checks=await this.github.pages('/commits/'+gate.head+'/check-runs','check_runs');
  const sonar=checks.filter(c=>c.name==='SonarCloud Code Analysis'&&c.app?.id===12526&&c.head_sha===gate.head).sort((a,b)=>String(b.started_at??'').localeCompare(String(a.started_at??'')))[0];
  if(sonar?.status!=='completed'||sonar.conclusion!=='success')return {merged:false,reason:'CURRENT_SONAR_QUALITY_GATE_REQUIRED'};
  if(!await officialSonarHead(this.github.repo,pr.number,gate.head,this.sonarFetch))return {merged:false,reason:'SONAR_ANALYZED_HEAD_NOT_CONFIRMED'};
  const allComments=await this.github.pages('/issues/'+pr.number+'/comments');
  const sonarAudit=exactHeadSonarAudit(allComments,sonar);
  if(!sonarAudit)return {merged:false,reason:'SONAR_FINDINGS_RECONCILIATION_REQUIRED'};
  const report=[
   'DUAL REVIEW VERIFIED FOR THIS HEAD',
   'Head SHA: '+gate.head,'Main SHA: '+gate.main,
   'Independent controller review: passed for this exact head and main.',
   'SonarQube Cloud: PASS (trusted app 12526; 0 new issues, 0 accepted findings; confirmed, false-positive, and deferred new findings: 0).',
   'Targeted, worker, independent release and browser/visual checks: '+(execution.checks??[]).join(', '),
   'Exact pnpm verify:release: PASS. Release job: '+release.id,
   'GitHub Sonar check: '+(sonar.html_url??'verified exact-head GitHub check')
  ].join('\n');
  const owner=this.github.repo.split('/')[0];
  let verified=allComments.find(c=>c.user?.login===owner&&c.body===report);
  if(!verified){
   if((await this.github.main()).sha!==gate.main||(await this.github.request('/pulls/'+pr.number)).head.sha!==gate.head)return {merged:false,reason:'STATE_CHANGED_BEFORE_DUAL_REVIEW_PROOF'};
   await this.github.proofComment(pr.number,report);
   verified=(await this.github.pages('/issues/'+pr.number+'/comments')).find(c=>c.user?.login===owner&&c.body===report);
  }
  if(!verified)return {merged:false,reason:'DUAL_REVIEW_PROOF_COMMENT_NOT_VERIFIED'};
  await this.ledger.receipt(release.id,'dual_review_github_proof',{pr:pr.number,head:gate.head,main:gate.main,comment_id:verified.id});
  // Persist intent before the external mutation. An uncertain response is never blindly retried.
  const reserved=await transaction(this.ledger.db,async c=>{
   await c.query('SELECT id FROM controller_guard WHERE id=1 FOR UPDATE');
   const seen=await c.query("SELECT id FROM evidence_receipts WHERE job_id=$1 AND kind='merge_intent'",[release.id]);
   if(seen.rows.length)return false;
   await this.ledger.receipt(release.id,'merge_intent',{pr:pr.number,head:gate.head,main:gate.main,authorized_issue:parent.issue_number},null,c);return true;
  });
  if(!reserved)return {merged:false,reason:'EXISTING_MERGE_INTENT_INSPECT_GITHUB'};
  try{
   if((await this.github.main()).sha!==gate.main||(await this.github.request('/pulls/'+pr.number)).head.sha!==gate.head)return {merged:false,reason:'STATE_CHANGED_BEFORE_MERGE'};
   const result=await this.github.mergePullRequest(pr.number,gate.head);
   await this.ledger.receipt(release.id,'merge_result',{...result,pr:pr.number,head:gate.head});
   if(result.merged)try{await this.send({id:'merged:'+release.id,name:'cartilla/manual.job',data:{jobId:parent.id}});}catch{/* scheduled reconciliation recovers the immediate rescan */}
   return result;
  }catch{
   await this.ledger.receipt(release.id,'merge_outcome_unknown',{pr:pr.number,head:gate.head});return {merged:false,reason:'MERGE_OUTCOME_UNKNOWN_INSPECT_GITHUB'};
  }
 }
}
