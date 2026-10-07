import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
export const digest=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
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
 if(Buffer.isBuffer(req.body)){if(req.body.length>limit)throw new Error('BODY_TOO_LARGE');return req.body;}
 if(typeof req.body==='string'){const b=Buffer.from(req.body);if(b.length>limit)throw new Error('BODY_TOO_LARGE');return b;}
 if(req.body!==undefined)throw new Error('RAW_BODY_UNAVAILABLE');
 const chunks=[];let size=0;for await(const chunk of req){const b=Buffer.from(chunk);size+=b.length;if(size>limit)throw new Error('BODY_TOO_LARGE');chunks.push(b);}return Buffer.concat(chunks);
}
