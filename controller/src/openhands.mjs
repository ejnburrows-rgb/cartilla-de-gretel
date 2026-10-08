// Official Cloud API, not the local Agent Server API.
// https://github.com/openhands/docs/blob/main/openhands/usage/cloud/cloud-api.mdx
export class OpenHands {
 constructor({key,fetcher=fetch}){this.key=key;this.fetcher=fetcher;}
 async authStatus(){
  if(!this.key)return {configured:false,authenticated:false};
  try{
   const r=await this.fetcher('https://app.all-hands.dev/api/keys/current',{method:'GET',headers:{Authorization:`Bearer ${this.key}`},signal:AbortSignal.timeout(15000)});
   return {configured:true,authenticated:r.ok,http_status:r.status};
  }catch{return {configured:true,authenticated:false,error:'OPENHANDS_UNREACHABLE'};}
 }
 async request(path,body){
  if(!this.key)throw new Error('OPENHANDS_API_KEY_REQUIRED');
  const r=await this.fetcher(`https://app.all-hands.dev/api/v1/app-conversations${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${this.key}`,'X-Access-Token':this.key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw new Error(`OPENHANDS_HTTP_${r.status}`);return r.json();
 }
 async start(repo,prompt){const r=await this.request('',{selected_repository:repo,initial_message:{content:[{type:'text',text:prompt}]}});if(typeof r.id!=='string')throw new Error('OPENHANDS_START_RESPONSE_INVALID');return {start_task_id:r.id,external_id:r.app_conversation_id??null,status:r.status};}
 async reusable(id,repo){
  const rows=await this.request(`?ids=${encodeURIComponent(id)}`);const r=Array.isArray(rows)?rows[0]:null;
  if(!r||['MISSING','ERROR'].includes(r.sandbox_status))return null;
  if(r.selected_repository!==repo)return null;
  if(r.sandbox_status==='PAUSED')return {external_id:id,sandbox_id:r.sandbox_id,sandbox_status:r.sandbox_status};
  if(r.sandbox_status==='RUNNING'&&r.execution_status==='finished')return {external_id:id,sandbox_id:r.sandbox_id,sandbox_status:r.sandbox_status};
  // An existing session in transition must not cause a replacement start.
  throw Error('OPENHANDS_SESSION_NOT_IDLE');
 }
 async continueSession(session,prompt){
  if(session.sandbox_status==='PAUSED'){
   try{
    const response=await this.fetcher(`https://app.all-hands.dev/api/v1/sandboxes/${encodeURIComponent(session.sandbox_id)}/resume`,{method:'POST',headers:{'X-Access-Token':this.key},signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw Error('OPENHANDS_RESUME_UNAVAILABLE');
    const rows=await this.request(`?ids=${encodeURIComponent(session.external_id)}`);
    if(rows[0]?.sandbox_status!=='RUNNING'||rows[0]?.execution_status!=='finished')throw Error('OPENHANDS_RESUME_PENDING');
   }catch(error){error.not_sent=true;throw error;}
  }
  const r=await this.request(`/${encodeURIComponent(session.external_id)}/send-message`,{role:'user',content:[{type:'text',text:prompt}],run:true});
  if(r.success!==true)throw Error('OPENHANDS_CONTINUATION_OUTCOME_UNKNOWN');
  return {start_task_id:null,external_id:session.external_id,status:'CONTINUED'};
 }
 async poll(attempt){
  if(!attempt.external_id){
   if(!attempt.start_task_id)throw new Error('DISPATCH_AMBIGUOUS');
   const rows=await this.request(`/start-tasks?ids=${encodeURIComponent(attempt.start_task_id)}`);const r=Array.isArray(rows)?rows[0]:rows;
   if(!r)throw new Error('OPENHANDS_START_TASK_MISSING');return {status:r.status,external_id:r.app_conversation_id??null,terminal:r.status==='ERROR',failed:r.status==='ERROR'};
  }
  const rows=await this.request(`?ids=${encodeURIComponent(attempt.external_id)}`);const r=Array.isArray(rows)?rows[0]:null;
  if(!r)throw new Error('OPENHANDS_CONVERSATION_MISSING');
  const progress={updated_at:r.updated_at??null,model:r.llm_model??null,cost:r.metrics?.accumulated_cost??null};
  if(this.key){
   try{
    const base=`https://app.all-hands.dev/api/v1/conversation/${encodeURIComponent(attempt.external_id)}/events`;
    const read=async path=>{const response=await this.fetcher(base+path,{method:'GET',headers:{'X-Access-Token':this.key},signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('PROGRESS_UNAVAILABLE');return response.json();};
    const [count,page]=await Promise.all([read('/count'),read('/search?sort_order=TIMESTAMP_DESC&limit=3')]);
    if(Number.isInteger(count)&&count>=0)progress.event_count=count;
    // No messages, commands, observations, prompts, or session keys leave this client.
    progress.latest_events=(page.items??[]).map(e=>({kind:e.kind,timestamp:e.timestamp,...(['agent','user','environment','hook'].includes(e.source)?{source:e.source}:{})}));
   }catch{progress.available=false;}
  }
  return {external_id:attempt.external_id,status:r.execution_status,sandbox_status:r.sandbox_status,progress,terminal:['finished','error','stuck'].includes(r.execution_status),failed:['error','stuck'].includes(r.execution_status),blocked:r.execution_status==='waiting_for_confirmation'};
 }
}
