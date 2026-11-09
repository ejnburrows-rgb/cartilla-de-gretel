if (!require('node:worker_threads').isMainThread) return;
if (process.env.VITEST_STARTUP_AUDIT_OWNER && process.env.VITEST_STARTUP_AUDIT_OWNER !== String(process.pid)) return;
process.env.VITEST_STARTUP_AUDIT_OWNER=String(process.pid);
const fs=require('node:fs');
const path=require('node:path');
const childProcess=require('node:child_process');
const {syncBuiltinESMExports}=require('node:module');
const output=process.env.VITEST_STARTUP_AUDIT_FILE||path.resolve(__dirname,'../docs/proofs/m7-m8-m9-verification/continuation/runner-repair/actual-parent-collection/fork-events.ndjson');
const fd=fs.openSync(output,'wx');
const log=(kind,detail)=>fs.writeSync(fd,JSON.stringify({utc:new Date().toISOString(),pid:process.pid,kind,detail})+'\n');
const originalFork=childProcess.fork;
const envKeys=['NODE_ENV','VITEST','VITEST_MODE','TEST','FORCE_TTY'];
childProcess.fork=function(entry,args,options){
 const opts=options||(Array.isArray(args)?{}:args)||{};
 const safeEnv=Object.fromEntries(envKeys.filter(key=>opts.env&&key in opts.env).map(key=>[key,opts.env[key]]));
 log('fork',{entry:String(entry),execPath:opts.execPath||process.execPath,execArgv:opts.execArgv,env:safeEnv,nodeOptionsPresent:Boolean(opts.env?.NODE_OPTIONS)});
 const child=Reflect.apply(originalFork,this,arguments);
 const originalSend=child.send;
 child.send=function(message){
  if(message?.__vitest_worker_request__===true){
   const config=message.context?.config;
   log('send',{childPid:child.pid,type:message.type,environment:message.context?.environment?.name,experimental:config?{viteModuleRunner:config.experimental?.viteModuleRunner,nodeLoader:config.experimental?.nodeLoader}:undefined,isAgent:config?.isAgent,hasSerializedDefines:Boolean(config?.serializedDefines),tracesEnabled:message.traces?.enabled,hasTraceSdk:Boolean(message.traces?.sdkPath)});
  }
  return Reflect.apply(originalSend,this,arguments);
 };
 child.on('message',message=>{if(message?.__vitest_worker_response__===true)log('response',{childPid:child.pid,type:message.type,hasError:Boolean(message.error)});});
 child.on('error',error=>log('child-error',{childPid:child.pid,name:error.name,code:error.code}));
 child.on('exit',(code,signal)=>log('child-exit',{childPid:child.pid,code,signal}));
 return child;
};
syncBuiltinESMExports();
log('preload-ready',{node:process.version});
