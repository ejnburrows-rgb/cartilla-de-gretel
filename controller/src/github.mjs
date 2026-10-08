import {digest,safeText} from './security.mjs';
export const instructionPaths=['AGENTS.md','PROJECT_FINISH_DEFINITION.md','PROJECT_SOURCE_OF_TRUTH.md','tasks/plan.md'];
export class GitHub {
 constructor({repo,token,fetcher=fetch,ledger,sleeper=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){if(!/^[\w.-]+\/[\w.-]+$/.test(repo??''))throw new Error('GITHUB_REPO_REQUIRED');this.repo=repo;this.token=token;this.ledger=ledger;this.fetcher=fetcher;this.sleeper=sleeper;}
 headers(){return {Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'cartilla-controller',...(this.token?{Authorization:`Bearer ${this.token}`}:{})};}
 safeURL(path){
  if(typeof path!=='string'||!/^\/(?:commits|contents|issues|pulls|compare)(?:[/?]|$)/.test(path))throw Error('INVALID_GITHUB_ENDPOINT');
  const q=path.indexOf('?');const pathname=q<0?path:path.slice(0,q);
  if(pathname.split('/').some(segment=>segment==='.'||segment==='..')||pathname.includes('//')||pathname.includes('\\')||/%(?:2e|2f|5c|00)/i.test(pathname)||/[\u0000-\u001f]/.test(pathname))throw Error('INVALID_GITHUB_ENDPOINT');
  const u=new URL('https://api.github.com');u.pathname='/repos/'+this.repo+pathname;
  if(q>=0)u.search=path.slice(q+1);
  if(u.hostname!=='api.github.com'||!u.pathname.startsWith('/repos/'+this.repo+'/'))throw Error('INVALID_GITHUB_ENDPOINT');
  return u.href;
 }

 async request(path){
  if(this.ledger){const gate=(await this.ledger.db.query("SELECT retry_at FROM jobs WHERE source->>'lane'='github_read_budget' AND retry_at>now() ORDER BY retry_at DESC LIMIT 1")).rows[0];if(gate){const error=new Error('GITHUB_RATE_LIMITED');error.retryAt=new Date(gate.retry_at).toISOString();throw error;}}
  let last;
  for(let attempt=0;attempt<3;attempt++){
   try{
    const url=this.safeURL(path);
    const r=await this.fetcher(url,{headers:this.headers(),redirect:'error',signal:AbortSignal.timeout(15000)});
    if(r.ok)return r.json();
    if(r.status===403||r.status===429){
     const remaining=r.headers?.get?.('x-ratelimit-remaining'),reset=Number(r.headers?.get?.('x-ratelimit-reset')),after=Number(r.headers?.get?.('retry-after'));
     let message='';try{message=String((await r.json()).message??'');}catch{}
     if(remaining==='0'||after>0||r.status===429||/rate limit|secondary rate/i.test(message)){
      const until=new Date(Math.min(Date.now()+7200000,Math.max(Date.now()+60000,reset>0?reset*1000:Date.now()+Math.max(60,after)*1000))).toISOString();
      if(this.ledger){const gate=await this.ledger.create({key:'github-read-budget:'+until,kind:'reconcile',source:{lane:'github_read_budget',provider:'github'},spec:{action:'Wait for GitHub read quota reset, then reconcile current state'}});await this.ledger.set(gate.id,'retrying','GITHUB_RATE_LIMITED',{retry_at:until,lease_until:null,next_action:'Durable wait until GitHub quota reset; continue independent work',owner_action:'Nothing'});}
      const error=new Error('GITHUB_RATE_LIMITED');error.retryAt=until;throw error;
     }
    }
    last=new Error(`GITHUB_HTTP_${r.status}`);
    if(![408,425,429,500,502,503,504].includes(r.status)||attempt===2)throw last;
   }catch(error){
    last=error;
    if(error.message==='GITHUB_RATE_LIMITED')throw error;
    const status=String(error?.message??'').match(/^GITHUB_HTTP_(\d+)$/)?.[1];
    if(attempt===2||(status&&!['408','425','429','500','502','503','504'].includes(status)))throw error;
   }
   await this.sleeper(250*(attempt+1));
  }
  throw last;
 }
 async ready(number){
  const detail=await this.request(`/pulls/${number}`);if(!detail.draft)return false;
  const r=await this.fetcher('https://api.github.com/graphql',{method:'POST',headers:{...this.headers(),'Content-Type':'application/json'},body:JSON.stringify({query:'mutation($id:ID!){markPullRequestReadyForReview(input:{pullRequestId:$id}){pullRequest{isDraft}}}',variables:{id:detail.node_id}}),signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw new Error(`GITHUB_READY_HTTP_${r.status}`);const body=await r.json();
  if(body.errors?.length||body.data?.markPullRequestReadyForReview?.pullRequest?.isDraft!==false)throw new Error('GITHUB_READY_REJECTED');return true;
 }
 async proofComment(number,body){
  if(!Number.isSafeInteger(number)||number<=0||typeof body!=='string'||!body.includes('DUAL REVIEW VERIFIED FOR THIS HEAD'))throw Error('INVALID_DUAL_REVIEW_PROOF');
  const url='https://api.github.com/repos/'+this.repo+'/issues/'+number+'/comments';
  const r=await this.fetcher(url,{method:'POST',headers:{...this.headers(),'Content-Type':'application/json'},body:JSON.stringify({body}),redirect:'error',signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error('GITHUB_PROOF_COMMENT_HTTP_'+r.status);
  const value=await r.json();
  if(!Number.isSafeInteger(value.id))throw Error('GITHUB_PROOF_COMMENT_UNCONFIRMED');
  return value.id;
 }
 async mergePullRequest(number,expectedHead){if(!Number.isSafeInteger(number)||! /^[a-f0-9]{40}$/.test(expectedHead))throw Error('INVALID_AUTHORIZED_MERGE');return this.merge(number,expectedHead);}
 async merge(number,expectedHead){
  const r=await this.fetcher(`https://api.github.com/repos/${this.repo}/pulls/${number}/merge`,{method:'PUT',headers:{...this.headers(),'Content-Type':'application/json'},body:JSON.stringify({sha:expectedHead,merge_method:'squash'}),signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw new Error(`GITHUB_MERGE_HTTP_${r.status}`);
  const body=await r.json();if(body.merged!==true)throw new Error('GITHUB_MERGE_REJECTED');return {merged:true,sha:body.sha??null};
 }
 async pages(path,field){
  const all=[];for(let page=1;page<=10;page++){
   const r=await this.request(`${path}${path.includes('?')?'&':'?'}per_page=100&page=${page}`);const rows=field?r[field]:r;
   if(!Array.isArray(rows))throw new Error('GITHUB_INVALID_PAGE');all.push(...rows);if(rows.length<100)return all;
  }throw new Error('GITHUB_PAGINATION_BOUND_REACHED');
 }
 async main(){const c=await this.request('/commits/main');if(!/^[a-f0-9]{40}$/.test(c.sha))throw new Error('GITHUB_INVALID_SHA');return {sha:c.sha,url:c.html_url,timestamp:c.commit?.committer?.date};}
 async file(path,sha){const r=await this.request(`/contents/${path}?ref=${sha}`);if(r.encoding!=='base64'||!r.content)throw new Error('GITHUB_FILE_UNREADABLE');return safeText(Buffer.from(r.content,'base64').toString('utf8'));}
 async snapshot(){
  const main=await this.main();
  const cached=this.ledger?(await this.ledger.db.query("SELECT data FROM project_snapshots WHERE main_sha=$1 AND data ? 'instruction_texts' ORDER BY recorded_at DESC LIMIT 1",[main.sha])).rows[0]?.data:null;
  const texts=cached&&instructionPaths.every(p=>typeof cached.instruction_texts?.[p]==='string')?instructionPaths.map(p=>cached.instruction_texts[p]):await Promise.all(instructionPaths.map(p=>this.file(p,main.sha)));
  const [issues,prs]=await Promise.all([this.pages('/issues?state=open'),this.pages('/pulls?state=open')]);
  return {main,instructions:Object.fromEntries(instructionPaths.map((p,i)=>[p,texts[i]])),instructionHashes:Object.fromEntries(instructionPaths.map((p,i)=>[p,digest(texts[i])])),issues:issues.filter(i=>!i.pull_request),prs,fetched_at:new Date().toISOString()};
 }
 async addIssueLabel(number,label){
  if(!Number.isSafeInteger(number)||number<=0||label!=='jules')throw Error('INVALID_ISSUE_LABEL');
  const url='https://api.github.com/repos/'+this.repo+'/issues/'+number+'/labels';
  const r=await this.fetcher(url,{method:'POST',headers:{...this.headers(),'Content-Type':'application/json'},body:JSON.stringify({labels:[label]}),redirect:'error',signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error('GITHUB_LABEL_HTTP_'+r.status);
  return r.json();
 }
 async julesStatus(number,since){
  if(!Number.isSafeInteger(number)||number<=0)throw Error('INVALID_JULES_ISSUE');
  const after=since?new Date(since):null;if(after&&Number.isNaN(after.getTime()))throw Error('INVALID_JULES_DISPATCH_TIME');
  const comments=(await this.pages('/issues/'+number+'/comments')).filter(c=>c.user?.login==='google-labs-jules[bot]'&&(!after||new Date(c.created_at)>=after));
  let taskId=null,prNumber=null;
  for(const c of comments){
   const body=String(c.body??'');
   const task=body.match(/jules\.google\.com\/task\/(\d+)/);if(task)taskId=task[1];
   const pr=body.match(/Ready for a review![\s\S]*?\/pull\/(\d+)/i);if(pr)prNumber=Number(pr[1]);
  }
  if(prNumber)return {status:'finished',terminal:true,task_id:taskId,pr_number:prNumber,external_id:taskId};
  if(taskId)return {status:'running',terminal:false,task_id:taskId,external_id:taskId};
  return {status:'queued',terminal:false,task_id:null,external_id:null};
 }
 async startJules(number,since){
  const issue=await this.request('/issues/'+number);const labels=new Set((issue.labels??[]).map(l=>typeof l==='string'?l:l.name));
  if(labels.has('jules')){const existing=await this.julesStatus(number,since);if(existing.task_id||existing.pr_number)return existing;throw Error('JULES_LABEL_ALREADY_PRESENT');}
  try{await this.addIssueLabel(number,'jules');}catch(error){const fresh=await this.request('/issues/'+number);if(!(fresh.labels??[]).some(l=>(typeof l==='string'?l:l.name)==='jules'))throw error;}
  return this.julesStatus(number,since);
 }
 async changes(job){
  let pr,detail,branch;
  if(job.worker==='jules'){
   const state=await this.julesStatus(job.issue_number,job.created_at);
   if(!state.pr_number)return {passed:false,reason:'NO_EXPECTED_PR'};
   detail=await this.request('/pulls/'+state.pr_number);
   if(detail.state!=='open'||detail.head?.repo?.full_name!==this.repo)return {passed:false,reason:'NO_EXPECTED_PR'};
   pr=detail;branch=detail.head.ref;
  }else{
   branch='controller/jobs/'+job.id;
   const prs=await this.pages('/pulls?state=all&head='+encodeURIComponent(this.repo.split('/')[0]+':'+branch));
   pr=prs.find(p=>p.head?.repo?.full_name===this.repo&&p.head?.ref===branch&&p.state==='open');
   if(!pr)return {passed:false,reason:'NO_EXPECTED_PR'};
   detail=await this.request('/pulls/'+pr.number);
  }
  const compare=await this.request('/compare/'+job.starting_sha+'...'+detail.head.sha);
  const files=await this.pages('/pulls/'+pr.number+'/files');
  const checks=await this.pages('/commits/'+detail.head.sha+'/check-runs','check_runs');
  const fresh=await this.request('/pulls/'+pr.number);if(fresh.head.sha!==detail.head.sha)return {passed:false,reason:'PR_HEAD_CHANGED_DURING_VALIDATION'};
  return {pr:{number:pr.number,url:pr.html_url,head:detail.head.sha,branch,updated_at:detail.updated_at,body:safeText(detail.body)},compare:{status:compare.status,ahead_by:compare.ahead_by,total_commits:compare.total_commits},files:files.map(f=>({filename:f.filename,status:f.status,additions:f.additions,deletions:f.deletions})),checks:checks.map(c=>({name:c.name,status:c.status,conclusion:c.conclusion,app_id:c.app?.id,head_sha:c.head_sha,completed_at:c.completed_at,started_at:c.started_at,url:c.html_url})),fetched_at:new Date().toISOString()};
 }
}
export function publicSnapshot(s){return {main:s.main,instructionHashes:s.instructionHashes,issues:s.issues.map(i=>({number:i.number,url:i.html_url,updated_at:i.updated_at,labels:i.labels.map(l=>l.name)})),prs:s.prs.map(p=>({number:p.number,head:p.head?.sha,branch:p.head?.ref,url:p.html_url,updated_at:p.updated_at})),fetched_at:s.fetched_at};}
