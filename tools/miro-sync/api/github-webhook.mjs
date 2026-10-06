import { verifyGitHubSignature, isRelevantGitHubEvent, reconcile } from '../lib.mjs';
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks).toString('utf8');
  if(!verifyGitHubSignature(body,req.headers['x-hub-signature-256'],process.env.GITHUB_WEBHOOK_SECRET))return res.status(401).json({ok:false,error:'invalid_signature'});
  const event=req.headers['x-github-event'],deliveryId=req.headers['x-github-delivery'],payload=JSON.parse(body||'{}');
  if(event==='ping')return res.status(200).json({ok:true,ping:true});
  if(!isRelevantGitHubEvent(event,payload))return res.status(202).json({ok:true,ignored:true});
  try{return res.status(200).json(await reconcile({trigger:`webhook:${event}:${payload.action??'push'}`,deliveryId}));}catch(e){console.error(e);return res.status(500).json({ok:false,error:String(e?.message??e)});}
}
