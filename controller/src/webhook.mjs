import {signatureOK} from './security.mjs';
export async function webhook(raw,headers,options){
 const env=options.env??process.env;
 if(!env.GITHUB_WEBHOOK_SECRET)return {status:503,body:{error:'WEBHOOK_NOT_CONFIGURED'}};
 if(!signatureOK(raw,headers['x-hub-signature-256'],env.GITHUB_WEBHOOK_SECRET))return {status:401,body:{error:'INVALID_SIGNATURE'}};
 const delivery=headers['x-github-delivery'],type=headers['x-github-event'];
 if(typeof delivery!=='string'||delivery.length>200||!delivery||typeof type!=='string'||type.length>100)return {status:400,body:{error:'INVALID_HEADERS'}};
 let payload;try{payload=JSON.parse(raw.toString('utf8'));}catch{return {status:400,body:{error:'INVALID_JSON'}};}
 if(payload.repository?.full_name?.toLowerCase()!==env.GITHUB_REPO?.toLowerCase())return {status:403,body:{error:'WRONG_REPOSITORY'}};
 const {ledger,send}=options;
 const {job,duplicate}=await ledger.receive(delivery,type,raw,payload);
 const queued=await ledger.queue(job,send);
 return {status:202,body:{stored:true,duplicate,jobId:job.id,queued}};
}
