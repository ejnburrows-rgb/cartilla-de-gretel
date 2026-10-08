import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {Readable} from 'node:stream';
import handler from '../api/handler.mjs';
createServer(async(req,res)=>{
 try{
  if(req.url?.startsWith('/api/')){
   const method=req.method??'GET';
   const request=new Request(new URL(req.url,'http://127.0.0.1:3001'),{method,headers:req.headers,...(['GET','HEAD'].includes(method)?{}:{body:Readable.toWeb(req),duplex:'half'})});
   const output=await handler.fetch(request);
   res.writeHead(output.status,Object.fromEntries(output.headers));
   res.end(Buffer.from(await output.arrayBuffer()));return;
  }
  res.setHeader('Content-Type','text/html');res.end(await readFile(new URL('../public/index.html',import.meta.url)));
 }catch{res.writeHead(503);res.end('Controller development server unavailable');}
}).listen(3001,'127.0.0.1',()=>console.log('http://127.0.0.1:3001'));
