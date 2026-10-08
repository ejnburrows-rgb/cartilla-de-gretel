import {inngest,runtime} from './runtime.mjs';
// A shared provider cooldown is not a failed worker attempt. Keep the existing
// Inngest poll alive and sleep until GitHub allows another read.
export async function quotaAwarePoll(poll){
 try{return await poll();}
 catch(error){if(error?.message==='GITHUB_RATE_LIMITED'&&error.retryAt)return {done:false,github_resume_at:error.retryAt};throw error;}
}
export const processGithubEvent=inngest.createFunction({id:'process-github-event',triggers:[{event:'cartilla/github.received'}],retries:3,concurrency:1,idempotency:'event.data.deliveryId'},async({step})=>step.run('reconcile-stored-event',()=>runtime().runner.reconcile()));
export const CONTROLLER_RECONCILE_CRON='* * * * *';
export const controllerReconcile=inngest.createFunction({id:'controller-reconcile',triggers:[{cron:CONTROLLER_RECONCILE_CRON}],retries:3,concurrency:1},async({step})=>step.run('recover-rescan-refill',()=>runtime().runner.reconcile()));
export const dailyRepositoryReconciliation=inngest.createFunction({id:'daily-repository-reconciliation',triggers:[{cron:'0 9 * * *'}],retries:3,concurrency:1},async({step})=>step.run('daily-current-repository-state',()=>runtime().runner.reconcile()));
export const pollExternalWorker=inngest.createFunction({id:'poll-external-worker',triggers:[{event:'cartilla/worker.poll'}],retries:3,concurrency:{limit:1,key:'event.data.jobId'}},async({event,step})=>{
 for(let i=0;i<240;i++){
  const result=await step.run(`poll-existing-conversation-${i}`,()=>quotaAwarePoll(()=>runtime().runner.poll(event.data.jobId)));
  if(result.done)return result;
  if(result.github_resume_at){await step.sleepUntil(`worker-github-budget-${i}`,new Date(result.github_resume_at));continue;}
  await step.sleep(`durable-poll-wait-${i}`,'30s');
 }
 return {continued_by:'controller-reconcile'};
});
export const manualJob=inngest.createFunction({id:'manual-job',triggers:[{event:'cartilla/manual.job'}],retries:3,concurrency:1},async({event,step})=>{if(event.data.retryAt)await step.sleepUntil('durable-retry-deadline',new Date(event.data.retryAt));return step.run('admin-request-rescan',async()=>{
 const {runner,ledger}=runtime();const job=await ledger.get(event.data.jobId);if(!job)return {missing:true};
 if(job.kind==='reconcile')return runner.process(job.id);
 if(job.kind==='repo_inspection'&&!['verified','cancelled','failed','dead_letter','waiting','running'].includes(job.status))return {dispatched:await runner.dispatch(job,await runner.snapshot())};
 return runner.rescan();
});});
export const releaseVerifier=inngest.createFunction({id:'release-verifier',triggers:[{event:'cartilla/release.poll'}],retries:3,concurrency:{limit:1,key:'event.data.jobId'}},async({event,step})=>{
 if(event.data.retryAt)await step.sleepUntil('release-retry-deadline',new Date(event.data.retryAt));
 for(let i=0;i<180;i++){const result=await step.run('poll-independent-release-'+i,()=>runtime().releaseLoop.advance(event.data.jobId));if(result.done)return result;if(result.github_resume_at){await step.sleepUntil('release-github-budget-'+i,new Date(result.github_resume_at));continue;}await step.sleep('release-durable-wait-'+i,'30s');}
 return {continued_by:'controller-reconcile'};
});
export const functions=[processGithubEvent,controllerReconcile,dailyRepositoryReconciliation,pollExternalWorker,manualJob,releaseVerifier];
