// Official Cloud API, not the local Agent Server API.
// https://github.com/openhands/docs/blob/main/openhands/usage/cloud/cloud-api.mdx
export class OpenHands {
 constructor({key,fetcher=fetch}){this.key=key;this.fetcher=fetcher;}
 async request(path,body){
  if(!this.key)throw new Error('OPENHANDS_API_KEY_REQUIRED');
  const r=await this.fetcher(`https://app.all-hands.dev/api/v1/app-conversations${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${this.key}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw new Error(`OPENHANDS_HTTP_${r.status}`);return r.json();
 }
 async start(repo,prompt){const r=await this.request('',{selected_repository:repo,initial_message:{content:[{type:'text',text:prompt}]}});if(typeof r.id!=='string')throw new Error('OPENHANDS_START_RESPONSE_INVALID');return {start_task_id:r.id,external_id:r.app_conversation_id??null,status:r.status};}
 async poll(attempt){
  if(!attempt.external_id){
   if(!attempt.start_task_id)throw new Error('DISPATCH_AMBIGUOUS');
   const rows=await this.request(`/start-tasks?ids=${encodeURIComponent(attempt.start_task_id)}`);const r=Array.isArray(rows)?rows[0]:rows;
   if(!r)throw new Error('OPENHANDS_START_TASK_MISSING');return {status:r.status,external_id:r.app_conversation_id??null,terminal:r.status==='ERROR',failed:r.status==='ERROR'};
  }
  const rows=await this.request(`?ids=${encodeURIComponent(attempt.external_id)}`);const r=Array.isArray(rows)?rows[0]:null;
  if(!r)throw new Error('OPENHANDS_CONVERSATION_MISSING');
  return {external_id:attempt.external_id,status:r.execution_status,sandbox_status:r.sandbox_status,terminal:['finished','error','stuck'].includes(r.execution_status),failed:['error','stuck'].includes(r.execution_status),blocked:r.execution_status==='waiting_for_confirmation'};
 }
}
