const {fork} = require('node:child_process');
const path = require('node:path');
async function probe(execPath) {
  const record={node:execPath, events:[], started:Date.now()};
  return new Promise(resolve => {
    const child=fork(path.join(__dirname,'ipc-probe-child.cjs'),[],{execPath,serialization:'advanced',stdio:'pipe'});
    record.pid=child.pid;
    child.stdout.on('data',data=>record.events.push({stdout:String(data)}));
    child.stderr.on('data',data=>record.events.push({stderr:String(data)}));
    const timer=setTimeout(()=>{record.timeout=true;child.kill();},5000);
    child.on('error',error=>record.events.push({error:error.message}));
    child.on('message',message=>{
      record.events.push(message);
      if(message.type==='ready')child.send({nonce:'bounded-ipc-check'});
      if(message.type==='echo')record.echo=message.nonce==='bounded-ipc-check';
    });
    child.on('exit',(code,signal)=>{
      clearTimeout(timer);record.exitCode=code;record.signal=signal;record.elapsedMs=Date.now()-record.started;resolve(record);
    });
  });
}
(async()=>{
  const results=[];
  for(const executable of ['C:/Program Files/nodejs/node.exe','C:/Users/EJN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'])results.push(await probe(executable));
  console.log(JSON.stringify(results,null,2));
  process.exitCode=results.every(result=>result.echo&&result.exitCode===0)?0:1;
})();
