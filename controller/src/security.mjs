import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
function canonical(value){return Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort((a,b)=>a<b?-1:a>b?1:0).map(k=>[k,canonical(value[k])])):value;}
export const digest=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(canonical(value))).digest('hex');
export function signatureOK(raw,signature,secret){
 if(!secret||!/^sha256=[a-f0-9]{64}$/.test(signature??''))return false;
 return timingSafeEqual(Buffer.from(signature.slice(7),'hex'),createHmac('sha256',secret).update(raw).digest());
}
export function authorized(header,token){
 if(!token||token.length<32||typeof header!=='string')return false;
 const a=Buffer.from(header),b=Buffer.from(`Bearer ${token}`);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export function safeText(value,env=process.env){
 let s=String(value??'');
 for(const [k,v]of Object.entries(env))if(/SECRET|TOKEN|API_KEY|DATABASE_URL|SIGNING_KEY|EVENT_KEY/.test(k)&&v&&v.length>=8)s=s.split(v).join('[REDACTED]');
 return s.replace(/(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|sk-[A-Za-z0-9_-]{16,}|postgres(?:ql)?:\/\/[^\s]+)/g,'[REDACTED]').slice(0,100000);
}
export async function rawBody(req,limit=2*1024*1024){
 if(req instanceof Request){
  if(!req.body)return Buffer.alloc(0);
  const reader=req.body.getReader(),chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error('BODY_TOO_LARGE');}chunks.push(Buffer.from(value));}return Buffer.concat(chunks);}
  finally{reader.releaseLock();}
 }
 if(Buffer.isBuffer(req.body)){if(req.body.length>limit)throw new Error('BODY_TOO_LARGE');return req.body;}
 if(typeof req.body==='string'){const b=Buffer.from(req.body);if(b.length>limit)throw new Error('BODY_TOO_LARGE');return b;}
 if(req.body!==undefined)throw new Error('RAW_BODY_UNAVAILABLE');
 return new Promise((resolve,reject)=>{const chunks=[];let size=0;req.on('data',chunk=>{const b=Buffer.from(chunk);size+=b.length;if(size>limit){reject(new Error('BODY_TOO_LARGE'));return;}chunks.push(b);});req.on('end',()=>resolve(Buffer.concat(chunks)));req.on('error',reject);});
}
