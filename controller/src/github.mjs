import {digest,safeText} from './security.mjs';
export const instructionPaths=['AGENTS.md','PROJECT_FINISH_DEFINITION.md','PROJECT_SOURCE_OF_TRUTH.md','tasks/plan.md'];
export class GitHub {
 constructor({repo,token,fetcher=fetch}){if(!/^[\w.-]+\/[\w.-]+$/.test(repo??''))throw new Error('GITHUB_REPO_REQUIRED');this.repo=repo;this.token=token;this.fetcher=fetcher;}
 async request(path){
  const r=await this.fetcher(`https://api.github.com/repos/${this.repo}${path}`,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'cartilla-controller',...(this.token?{Authorization:`Bearer ${this.token}`}:{})},signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw new Error(`GITHUB_HTTP_${r.status}`);return r.json();
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
  const main=await this.main();const texts=await Promise.all(instructionPaths.map(p=>this.file(p,main.sha)));
  const [issues,prs]=await Promise.all([this.pages('/issues?state=open'),this.pages('/pulls?state=open')]);
  return {main,instructions:Object.fromEntries(instructionPaths.map((p,i)=>[p,texts[i]])),instructionHashes:Object.fromEntries(instructionPaths.map((p,i)=>[p,digest(texts[i])])),issues:issues.filter(i=>!i.pull_request),prs,fetched_at:new Date().toISOString()};
 }
 async changes(job){
  const branch=`controller/jobs/${job.id}`;
  const prs=await this.pages(`/pulls?state=all&head=${encodeURIComponent(this.repo.split('/')[0]+':'+branch)}`);
  const pr=prs.find(p=>p.head?.repo?.full_name===this.repo&&p.head?.ref===branch&&p.state==='open');
  if(!pr)return {passed:false,reason:'NO_EXPECTED_PR'};
  const detail=await this.request(`/pulls/${pr.number}`);
  const compare=await this.request(`/compare/${job.starting_sha}...${detail.head.sha}`);
  const files=await this.pages(`/pulls/${pr.number}/files`);
  const checks=await this.pages(`/commits/${detail.head.sha}/check-runs`,'check_runs');
  const fresh=await this.request(`/pulls/${pr.number}`);if(fresh.head.sha!==detail.head.sha)return {passed:false,reason:'PR_HEAD_CHANGED_DURING_VALIDATION'};
  return {pr:{number:pr.number,url:pr.html_url,head:detail.head.sha,branch,updated_at:detail.updated_at,body:safeText(detail.body)},compare:{status:compare.status,ahead_by:compare.ahead_by,total_commits:compare.total_commits},files:files.map(f=>({filename:f.filename,status:f.status,additions:f.additions,deletions:f.deletions})),checks:checks.map(c=>({name:c.name,status:c.status,conclusion:c.conclusion,app_id:c.app?.id,head_sha:c.head_sha,completed_at:c.completed_at,started_at:c.started_at,url:c.html_url})),fetched_at:new Date().toISOString()};
 }
}
export function publicSnapshot(s){return {main:s.main,instructionHashes:s.instructionHashes,issues:s.issues.map(i=>({number:i.number,url:i.html_url,updated_at:i.updated_at,labels:i.labels.map(l=>l.name)})),prs:s.prs.map(p=>({number:p.number,head:p.head?.sha,branch:p.head?.ref,url:p.html_url,updated_at:p.updated_at})),fetched_at:s.fetched_at};}
