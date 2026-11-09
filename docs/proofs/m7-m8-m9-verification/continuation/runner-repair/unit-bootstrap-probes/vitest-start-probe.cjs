const fs=require('node:fs');
const {fork}=require('node:child_process');
const {performance}=require('node:perf_hooks');
const destination='docs/proofs/m7-m8-m9-verification/continuation/runner-repair/vitest-start-probe.json';
if(fs.existsSync(destination)) throw Error('Refusing to overwrite prior probe');
const entry='D:/Downloads/La Cartilla de Gretel/node_modules/.pnpm/vitest@4.1.8_@types+node@22_5d6e5504655f37a8209a39a4ce7a0c27/node_modules/vitest/dist/workers/forks.js';
const startMessage={__vitest_worker_request__:true,type:'start',poolId:1,workerId:1,options:{reportMemory:false},context:{environment:{name:'jsdom',options:{}},config:{name:'bounded-start-probe',root:process.cwd(),experimental:{viteModuleRunner:true},isAgent:false},pool:'forks'},traces:{enabled:false}};
const result={startedUtc:new Date().toISOString(),scope:'actual installed forks.js plus minimal real start request; no app/test/setup imports',events:[],stdout:'',stderr:'',startMessage};
const save=()=>fs.writeFileSync(destination,JSON.stringify(result,null,2));save();
const start=performance.now();
const child=fork(entry,[],{execPath:'C:/Program Files/nodejs/node.exe',execArgv:[],stdio:'pipe',serialization:'advanced'});
const timer=setTimeout(()=>{result.timedOut=true;child.kill();},60000);
child.on('message',message=>{
 result.events.push({ms:performance.now()-start,message});save();
 if(message?.type==='started'){
  result.startedResponse=true;result.startedError=message.error;
  child.send({__vitest_worker_request__:true,type:'stop'});
 }
 if(message?.type==='stopped') child.disconnect();
});
child.stdout.on('data',chunk=>{result.stdout+=chunk;save();});
child.stderr.on('data',chunk=>{result.stderr+=chunk;save();});
child.on('error',error=>{result.error=String(error);save();});
child.on('exit',(code,signal)=>{clearTimeout(timer);Object.assign(result,{code,signal,ms:performance.now()-start,finishedUtc:new Date().toISOString()});save();console.log(JSON.stringify(result));process.exitCode=result.startedResponse&&!result.startedError&&!result.timedOut?0:1;});
child.send(startMessage,error=>{result.initialSendError=error?String(error):null;save();});
