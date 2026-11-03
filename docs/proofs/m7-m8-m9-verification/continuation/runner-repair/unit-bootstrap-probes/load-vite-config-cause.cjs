const fs=require('node:fs');
const destination='docs/proofs/m7-m8-m9-verification/continuation/runner-repair/parent-config-cause/error.json';
(async()=>{
 try { const vite=await import('vite');await vite.loadConfigFromFile({command:'serve',mode:'test'});fs.writeFileSync(destination,JSON.stringify({loaded:true})); }
 catch(error){fs.writeFileSync(destination,JSON.stringify({name:error.name,message:error.message,code:error.code,stack:error.stack,cause:error.cause?{name:error.cause.name,message:error.cause.message,code:error.cause.code,stack:error.cause.stack}:undefined},null,2));process.exitCode=1;}
})();
