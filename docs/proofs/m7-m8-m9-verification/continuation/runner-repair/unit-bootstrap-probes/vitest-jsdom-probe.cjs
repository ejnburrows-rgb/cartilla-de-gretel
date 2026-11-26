const fs=require('node:fs');
const {fork}=require('node:child_process');
const path=require('node:path');
const {performance}=require('node:perf_hooks');
const destination='docs/proofs/m7-m8-m9-verification/continuation/runner-repair/jsdom-bootstrap-probe.json';
if(fs.existsSync(destination)) throw Error('Refusing to overwrite prior probe');
const environment='D:/Downloads/La Cartilla de Gretel/node_modules/.pnpm/vitest@4.1.8_@types+node@22_5d6e5504655f37a8209a39a4ce7a0c27/node_modules/vitest/dist/chunks/index.DC7d2Pf8.js';
const results={startedUtc:new Date().toISOString(),scope:'installed Vitest jsdom.setup(globalThis,{}) in fork; no app/setup imports',runs:[]};
const save=()=>fs.writeFileSync(destination,JSON.stringify(results,null,2));
save();
async function probe(execPath){
 return new Promise(resolve=>{
  const start=performance.now();
  const run={execPath,events:[],stdout:'',stderr:''};results.runs.push(run);save();
  const child=fork(path.join(__dirname,'vitest-jsdom-child.cjs'),[environment],{execPath,execArgv:[],stdio:'pipe',serialization:'advanced'});
  child.on('message',message=>{run.events.push(message);save();});
  child.stdout.on('data',chunk=>{run.stdout+=chunk;save();});
  child.stderr.on('data',chunk=>{run.stderr+=chunk;save();});
  child.on('error',error=>{run.error=String(error);save();});
  const timer=setTimeout(()=>{run.timedOut=true;child.kill();},60000);
  child.on('exit',(code,signal)=>{clearTimeout(timer);Object.assign(run,{code,signal,ms:performance.now()-start});save();resolve();});
 });
}
(async()=>{
 await probe('C:/Program Files/nodejs/node.exe');
 await probe('C:/Users/EJN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe');
 results.finishedUtc=new Date().toISOString();save();console.log(JSON.stringify(results));
 process.exitCode=results.runs.every(run=>run.code===0&&!run.timedOut)?0:1;
})();
