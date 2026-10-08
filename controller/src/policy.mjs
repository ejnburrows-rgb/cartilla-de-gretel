import {digest,safeText} from './security.mjs';
const forbidden=/^(?:\.github\/|\.env|vercel\.json$|controller\/|AGENTS\.md$|PROJECT_.*\.md$|tasks\/)/;
export function parseSpec(issue,repo){
 const labels=new Set(issue.labels.map(l=>l.name));
 if(!labels.has('controller:ready'))return {runnable:false,reason:'NOT_OPTED_IN'};
 if(['blocked','owner-gated','SOURCE_BLOCKED','controller:blocked'].some(l=>labels.has(l)))return {runnable:false,reason:'ISSUE_GATED'};
 if(issue.user?.login!==repo.split('/')[0])return {runnable:false,reason:'OWNER_AUTHORED_SCOPE_REQUIRED'};
 const matches=[...(issue.body??'').matchAll(/```cartilla-controller[ \t]*\r?\n([\s\S]*?)```/g)];
 if(matches.length!==1)return {runnable:false,reason:'BOUNDED_SCOPE_REQUIRED'};
 let spec;try{spec=JSON.parse(matches[0][1]);}catch{return {runnable:false,reason:'INVALID_SCOPE_JSON'};}
 if(Object.keys(spec).some(k=>!['action','paths','dependencies','required_checks','deadline_minutes'].includes(k)))return {runnable:false,reason:'UNKNOWN_SCOPE_FIELD'};
 if(typeof spec.action!=='string'||!spec.action.trim()||spec.action.length>5000||!Array.isArray(spec.paths)||!spec.paths.length||spec.paths.length>30||spec.paths.some(p=>typeof p!=='string'||!p||p.includes('..')||p.includes('*')||p.startsWith('/')||forbidden.test(p)))return {runnable:false,reason:'UNSAFE_OR_UNBOUNDED_SCOPE'};
 if(!Array.isArray(spec.dependencies)||spec.dependencies.some(n=>!Number.isInteger(n)||n<1)||!Array.isArray(spec.required_checks)||!spec.required_checks.length||spec.required_checks.some(n=>typeof n!=='string'||!n.trim()))return {runnable:false,reason:'DEPENDENCY_AND_CHECK_CONTRACT_REQUIRED'};
 if(!Number.isInteger(spec.deadline_minutes)||spec.deadline_minutes<5||spec.deadline_minutes>120)return {runnable:false,reason:'INVALID_DEADLINE'};
 if(/(?:merge|deploy|rotat\w* secret|delete branch|production configuration)/i.test(spec.action))return {runnable:false,reason:'FORBIDDEN_ACTION'};
 spec.action=safeText(spec.action);return {runnable:true,spec,hash:digest(spec)};
}
export const overlaps=(a,b)=>a.some(x=>b.some(y=>x===y||x.startsWith(y.endsWith('/')?y:y+'/')||y.startsWith(x.endsWith('/')?x:x+'/')));
export function candidates(snapshot,active,repo){
 const selected=[];const blocked=[];const open=new Set(snapshot.issues.map(i=>i.number));
 for(const issue of snapshot.issues){
  const p=parseSpec(issue,repo);if(!p.runnable){if(p.reason!=='NOT_OPTED_IN')blocked.push({issue:issue.number,reason:p.reason});continue;}
  if(p.spec.dependencies.some(n=>open.has(n))){blocked.push({issue:issue.number,reason:'DEPENDENCY_OPEN'});continue;}
  // A referenced dependency absent from open state must be fetched and proven closed by runner.
  if(active.some(j=>j.issue_number===issue.number&&(['running','waiting'].includes(j.status)||(['verified','failed','dead_letter','cancelled'].includes(j.status)&&j.source.scope_hash===p.hash)))){continue;}
  if(snapshot.prs.some(pr=>new RegExp(`(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#${issue.number}\\b`,'i').test(pr.body??''))){blocked.push({issue:issue.number,reason:'EXISTING_PR_REQUIRES_REVIEW'});continue;}
  if(active.filter(j=>['running','waiting','blocked'].includes(j.status)&&j.external_id).some(j=>overlaps(j.spec.paths??[],p.spec.paths))||selected.some(j=>overlaps(j.spec.paths,p.spec.paths))){blocked.push({issue:issue.number,reason:'FILE_OWNERSHIP_OVERLAP'});continue;}
  selected.push({issue,spec:p.spec,hash:p.hash});
 }
 return {selected,blocked};
}
export function validateChange(job,evidence,apps){
 if(evidence.passed===false)return {passed:false,reason:evidence.reason};
 if(evidence.compare?.status!=='ahead'||!evidence.compare.ahead_by)return {passed:false,reason:'NO_NEW_ANCESTOR_BASED_COMMITS'};
 const material=evidence.files.filter(f=>f.status!=='removed'&&f.additions+f.deletions>0);
 if(!material.length)return {passed:false,reason:'NO_MATERIAL_CHANGE'};
 if(evidence.files.some(f=>f.status==='removed'||forbidden.test(f.filename)||!job.spec.paths.some(p=>f.filename===p||f.filename.startsWith(p.endsWith('/')?p:p+'/'))))return {passed:false,reason:'SCOPE_VIOLATION'};
 if(!new RegExp(`(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|references)\\s+#${job.issue_number}\\b`,'i').test(evidence.pr.body??''))return {passed:false,reason:'CANONICAL_ISSUE_NOT_LINKED'};
 if(!apps.length)return {passed:false,reason:'TRUSTED_CHECK_APPS_NOT_CONFIGURED'};
 for(const name of job.spec.required_checks){
  const matches=evidence.checks.filter(c=>c.name===name&&apps.includes(c.app_id)&&c.head_sha===evidence.pr.head);
  const latest=matches.sort((a,b)=>String(b.started_at).localeCompare(String(a.started_at)))[0];
  if(!latest||latest.status!=='completed'||latest.conclusion!=='success')return {passed:false,reason:`REQUIRED_CHECK_NOT_PASSED:${name}`};
 }
 return {passed:true,sha:evidence.pr.head,pr:evidence.pr.number,material_files:material.map(f=>f.filename),checks:job.spec.required_checks};
}
