import { reconcile } from '../lib.mjs';
export default async function handler(req,res){
  if(!process.env.CRON_SECRET||req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({ok:false,error:'unauthorized'});
  try{return res.status(200).json(await reconcile({trigger:req.headers['x-vercel-cron']==='1'?'scheduled-reconcile':'forced-reconcile'}));}catch(e){console.error(e);return res.status(500).json({ok:false,error:String(e?.message??e)});}
}
