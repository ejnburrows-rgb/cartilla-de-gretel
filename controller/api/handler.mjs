import {serve} from 'inngest/edge';
import {functions} from '../src/functions.mjs';
import {inngest,runtime} from '../src/runtime.mjs';
import {api} from '../src/api.mjs';
import {rawBody} from '../src/security.mjs';
const inngestHandler=serve({client:inngest,functions});
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
// Vercel's Web Standard handler preserves signed bytes without Node body helpers.
export default {async fetch(request){
 if(new URL(request.url).pathname==='/api/inngest'){
  if(!process.env.INNGEST_SIGNING_KEY)return Response.json({error:'INNGEST_NOT_CONFIGURED'},{status:503,headers});
  return inngestHandler(request);
 }
 try{
  const requestHeaders=Object.fromEntries(request.headers);
  const path=new URL(request.url).pathname;
  const ownerRead= request.method==='GET' && (
    path==='/api/status' ||
    path==='/api/project-lanes' ||
    path==='/api/jobs' ||
    /^\/api\/jobs\/[a-f0-9-]{36}\/history$/.test(path)
  );
  if(ownerRead&&process.env.CONTROLLER_READ_TOKEN){
    requestHeaders.authorization='Bearer '+process.env.CONTROLLER_READ_TOKEN;
  }
  const req={url:request.url,method:request.method,headers:requestHeaders,body:request.method==='POST'?await rawBody(request):undefined};
  const deps={get ledger(){return runtime().ledger;},get github(){return runtime().github;},get readonlyGithub(){return runtime().readonlyGithub;},get worker(){return runtime().worker;},send:event=>runtime().send(event)};
  const r=await api(req,deps);return Response.json(r.body,{status:r.status,headers});
 }catch(e){
  const bad=['BODY_TOO_LARGE','RAW_BODY_UNAVAILABLE'].includes(e.message),conflict=['RETRY_UNSAFE','CANCEL_UNSAFE','JOB_NOT_FOUND'].includes(e.message);
  return Response.json({error:bad||conflict?e.message:'CONTROLLER_DEPENDENCY_UNAVAILABLE'},{status:bad?400:conflict?409:503,headers});
 }
}};
