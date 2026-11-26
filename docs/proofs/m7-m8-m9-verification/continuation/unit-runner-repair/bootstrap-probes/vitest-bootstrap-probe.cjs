const {fork}=require('node:child_process');
const path=require('node:path');
const entry='D:/Downloads/La Cartilla de Gretel/node_modules/.pnpm/vitest@4.1.8_@types+node@22_5d6e5504655f37a8209a39a4ce7a0c27/node_modules/vitest/dist/workers/forks.js';
async function probe(execPath){
 return new Promise(resolve=>{
  const record={execPath,events:[],started:Date.now()};
  const child=fork(path.join(__dirname,'vitest-bootstrap-child.cjs'),[entry],{execPath,serialization:'advanced',stdio:'pipe'});
  record.pid=child.pid;
  child.stderr.on('data',data=>record.events.push({stderr:String(data)}));
  child.stdout.on('data',data=>record.events.push({stdout:String(data)}));
  child.on('message',message=>record.events.push(message));
  child.on('error',error=>record.events.push({error:error.stack}));
  const timer=setTimeout(()=>{record.timeout=true;child.kill();},10000);
  child.on('exit',(code,signal)=>{clearTimeout(timer);Object.assign(record,{exitCode:code,signal,elapsedMs:Date.now()-record.started});resolve(record);});
 });
}
(async()=>{
 const results=[];
 for(const exe of ['C:/Program Files/nodejs/node.exe','C:/Users/EJN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'])results.push(await probe(exe));
 console.log(JSON.stringify(results,null,2));
 process.exitCode=results.every(result=>result.events.some(event=>event.phase==='after-import')&&result.exitCode===0)?0:1;
})();
