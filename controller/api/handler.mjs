import {serve} from 'inngest/node';
import {functions} from '../src/functions.mjs';
import {inngest,runtime} from '../src/runtime.mjs';
import {api} from '../src/api.mjs';
export const config={api:{bodyParser:false}};
const inngestHandler=serve({client:inngest,functions});
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(new URL(req.url,'https://controller.local').pathname==='/api/inngest'){
  if(!process.env.INNGEST_SIGNING_KEY){res.statusCode=503;return res.end(JSON.stringify({error:'INNGEST_NOT_CONFIGURED'}));}
  return inngestHandler(req,res);
 }
 try{
  // Lazy dependencies allow authenticated configuration status before database provisioning.
  const deps={get ledger(){return runtime().ledger;},get github(){return runtime().github;},send:event=>runtime().send(event)};
  const r=await api(req,deps);res.statusCode=r.status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(r.body));
 }catch(e){
  const bad=['BODY_TOO_LARGE','RAW_BODY_UNAVAILABLE'].includes(e.message),conflict=['RETRY_UNSAFE','CANCEL_UNSAFE','JOB_NOT_FOUND'].includes(e.message);
  res.statusCode=bad?400:conflict?409:503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:bad||conflict?e.message:'CONTROLLER_DEPENDENCY_UNAVAILABLE'}));
 }
}
