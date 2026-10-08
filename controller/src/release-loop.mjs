import {randomUUID} from 'node:crypto';
import {transaction} from './db.mjs';
import {releaseCommand} from './release-executor.mjs';

// Durable execution uses the existing Neon ledger and Inngest, not a new queue.
export class ReleaseLoop{
 constructor({ledger,github,executor,send,env=process.env}){Object.assign(this,{ledger,github,executor,send,env});}
 async advance(id){
  let job=await this.ledger.get(id);if(!job||['verified','cancelled','dead_letter'].includes(job.status))return {done:true};
  if(job.source?.lane!=='release_verifier')throw Error('RELEASE_JOB_REQUIRED');
  if(this.env.OPENHANDS_ENABLED!=='true'){await this.ledger.set(id,'blocked','OPENHANDS_RELEASE_DISABLED',{next_action:'Await authorized OpenHands enablement',owner_action:'Nothing'});return {done:true,blocked:true};}
  let plan;try{plan=releaseCommand({repo:this.github.repo,head:job.source.head,jobId:job.id,files:job.spec.files??[],ui:job.spec.ui});}catch(error){await this.ledger.set(id,'blocked',error.message,{next_action:'Worker must persist a bounded targeted test before release verification',owner_action:'Nothing'});return {done:true,blocked:true};}
  let a=await this.ledger.attempt(id),fresh=false;
  if(!a&&typeof this.github.file==='function')for(const path of (job.spec.files??[]).filter(p=>/\.(test|spec)\.[cm]?[jt]sx?$/.test(p))){try{await this.github.file(path,job.source.head);}catch{await this.ledger.set(id,'blocked','TARGETED_TEST_PATH_MISSING',{next_action:'Persist the targeted test in the candidate commit',owner_action:'Nothing'});return {done:true,blocked:true};}}
  const currentPr=await this.github.request('/pulls/'+job.source.pr),currentMain=await this.github.main();
  if(currentPr.head.sha!==job.source.head||currentMain.sha!==job.source.main){if(a?.external_id&&a.state!=='ambiguous'){await this.executor.pause(a.external_id);await this.ledger.db.query("UPDATE job_attempts SET state='failed',updated_at=now() WHERE id=$1",[a.id]);}await this.ledger.set(id,'blocked','RELEASE_STATE_CHANGED',{next_action:'Request a new verification for current PR head and main',owner_action:'Nothing'});return {done:true,blocked:true};}
  if(!a||a.state==='failed'){
   if(job.status==='retrying'&&new Date(job.retry_at)>new Date())return {done:true};
   a=await transaction(this.ledger.db,async c=>{
    await c.query('SELECT id FROM controller_guard WHERE id=1 FOR UPDATE');
    const j=(await c.query('SELECT * FROM jobs WHERE id=$1 FOR UPDATE',[id])).rows[0];
    if(!j||['running','waiting','verified','cancelled','dead_letter'].includes(j.status))return null;
    const busy=await c.query("SELECT id FROM job_attempts WHERE worker='openhands-release' AND state IN('reserved','running','ambiguous')");
    if(busy.rows.length)return null;
    const attempt={id:randomUUID(),attempt_number:j.attempt_count+1,state:'reserved',deadline:new Date(Date.now()+90*60000).toISOString()};
    await c.query("INSERT INTO job_attempts(id,job_id,attempt_number,worker,payload_hash,starting_sha,state,deadline) VALUES($1,$2,$3,'openhands-release',$4,$5,'reserved',$6)",[attempt.id,id,attempt.attempt_number,plan.hash,plan.head,attempt.deadline]);
    await c.query("UPDATE jobs SET status='running',attempt_count=$2,worker='openhands-release',starting_sha=$3,deadline=$4,lease_until=NULL,updated_at=now() WHERE id=$1",[id,attempt.attempt_number,plan.head,attempt.deadline]);
    return attempt;
   });
   if(!a)return {done:true,capacity_wait:true};fresh=true;
  }
  if(a.state==='ambiguous')return {done:true,blocked:true};
  if(!fresh&&a.payload_hash!==plan.hash){await this.block(job,a,'RELEASE_PLAN_CHANGED');return {done:true,blocked:true};}
  const lease=(await this.ledger.db.query("UPDATE jobs SET lease_until=now()+interval '1 minute' WHERE id=$1 AND status IN('running','waiting','blocked') AND (lease_until IS NULL OR lease_until<now()) RETURNING id",[id])).rows.length;
  if(!lease)return {done:false};
  a=await this.ledger.attempt(id);
  try{
   if(!a.external_id){
    if(!fresh){await this.block(job,a,'SANDBOX_CREATE_OUTCOME_UNKNOWN');return {done:true,blocked:true};}
    // The durable reservation precedes the single provisioning request.
    let r;try{r=await this.executor.create();}catch{await this.block(job,a,'SANDBOX_CREATE_OUTCOME_UNKNOWN');return {done:true,blocked:true};}
    a.external_id=r.sandbox_id;
    await this.ledger.db.query("UPDATE job_attempts SET external_id=$2,state='running',updated_at=now() WHERE id=$1",[a.id,a.external_id]);
    await this.ledger.db.query('UPDATE jobs SET external_id=$2 WHERE id=$1',[id,a.external_id]);
    await this.ledger.receipt(id,'release_sandbox',{sandbox_id:a.external_id,starting_sha:plan.head,payload_hash:plan.hash},a.id);
   }
   if(new Date(a.deadline)<new Date()){
    if(a.start_task_id)await this.ledger.receipt(id,'release_timeout_status',await this.executor.poll(a.external_id,a.start_task_id,plan),a.id);
    await this.executor.pause(a.external_id);
    await this.ledger.db.query("UPDATE job_attempts SET state='failed',updated_at=now() WHERE id=$1",[a.id]);
    await this.block(job,a,'RELEASE_DEADLINE_EXCEEDED',false);return {done:true,blocked:true};
   }
   if(!a.start_task_id){
    const reserved=await this.ledger.db.query("SELECT id FROM evidence_receipts WHERE attempt_id=$1 AND kind='release_command_reserved'",[a.id]);
    if(reserved.rows.length){await this.block(job,a,'RELEASE_COMMAND_OUTCOME_UNKNOWN');return {done:true,blocked:true};}
    const s=await this.executor.sandbox(a.external_id);if(s.status!=='RUNNING')return {done:false};
    await this.ledger.receipt(id,'release_command_reserved',{sandbox_id:a.external_id,payload_hash:plan.hash,head:plan.head},a.id);
    let r;try{r=await this.executor.start(a.external_id,plan);}catch{await this.block(job,a,'RELEASE_COMMAND_OUTCOME_UNKNOWN');return {done:true,blocked:true};}
    if(!r.ready){await this.block(job,a,'RELEASE_RUNTIME_CHANGED_BEFORE_START');return {done:true,blocked:true};}
    a.start_task_id=r.command_id;
    await this.ledger.db.query('UPDATE job_attempts SET start_task_id=$2,updated_at=now() WHERE id=$1',[a.id,r.command_id]);
    await this.ledger.receipt(id,'release_command_started',{command_id:r.command_id,payload_hash:plan.hash,head:plan.head},a.id);
   }
   const terminal=(await this.ledger.db.query("SELECT data FROM evidence_receipts WHERE attempt_id=$1 AND kind='release_execution_status' AND data->>'terminal'='true' ORDER BY recorded_at DESC LIMIT 1",[a.id])).rows[0]?.data;
   const result=terminal?.payload_hash===plan.hash&&terminal.command_id===a.start_task_id?terminal:await this.executor.poll(a.external_id,a.start_task_id,plan);
   if(!terminal)await this.ledger.receipt(id,'release_execution_status',result,a.id);
   if(!result.terminal)return {done:false};
   // Stop compute after completion. Retain IDs and retry pause if provider is uncertain.
   try{await this.executor.pause(a.external_id);}catch{return {done:false,pause_pending:true};}
   const pr=await this.github.request('/pulls/'+job.source.pr),main=await this.github.main();
   const passed=result.passed&&pr.head.sha===plan.head&&main.sha===job.source.main;
   await this.ledger.receipt(id,'github_validation',{head:pr.head.sha,main:main.sha,pr:pr.number,execution:result},a.id);
   await this.ledger.db.query('UPDATE job_attempts SET state=$2,updated_at=now() WHERE id=$1',[a.id,passed?'finished':'failed']);
   if(passed){await this.ledger.receipt(id,'independent_release_execution',{...result,main:main.sha,checks:['targeted','worker','release',...(plan.ui?['browser','visual']:[])]},a.id);await this.ledger.verify(id,a,'independent_clean_release_execution',{...result,passed:true,main:main.sha});}
   else{await this.ledger.fail(id,result.passed?'RELEASE_STATE_CHANGED':'RELEASE_COMMAND_FAILED');const current=await this.ledger.get(id);if(current.status==='retrying')try{await this.send({id:'release-retry:'+id+':'+a.attempt_number,name:'cartilla/release.poll',data:{jobId:id,retryAt:new Date(current.retry_at).toISOString()}});}catch{}}
   try{await this.send({id:'release-terminal:'+a.id,name:'cartilla/manual.job',data:{jobId:job.source.parent_job??id}});}catch{}
   const next=(await this.ledger.db.query("SELECT id FROM jobs WHERE source->>'lane'='release_verifier' AND status IN('received','queued','retrying') AND (retry_at IS NULL OR retry_at<=now()) ORDER BY created_at LIMIT 100")).rows;
   for(const ready of next)try{await this.send({id:'release-refill:'+a.id+':'+ready.id,name:'cartilla/release.poll',data:{jobId:ready.id}});}catch{}
   return {done:true,passed};
  }catch(error){await this.ledger.db.query("UPDATE jobs SET failure_reason='RELEASE_CONTROLLER_READ_FAILED' WHERE id=$1 AND status IN('running','waiting')",[id]);throw error;
  }finally{await this.ledger.db.query('UPDATE jobs SET lease_until=NULL,updated_at=now() WHERE id=$1',[id]);}
 }
 async block(job,a,reason,ambiguous=true){
  if(ambiguous)await this.ledger.db.query("UPDATE job_attempts SET state='ambiguous',updated_at=now() WHERE id=$1",[a.id]);
  await this.ledger.set(job.id,'blocked',reason,{next_action:'Inspect the same sandbox/command; never duplicate provisioning or execution',owner_action:'Nothing'});
 }
}
