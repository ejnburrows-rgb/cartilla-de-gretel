import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from '../api/handler.mjs';
createServer(async(req,res)=>{if(req.url.startsWith('/api/'))return handler(req,res);res.setHeader('Content-Type','text/html');res.end(await readFile(new URL('../public/index.html',import.meta.url)));}).listen(3001,'127.0.0.1',()=>console.log('http://127.0.0.1:3001'));
