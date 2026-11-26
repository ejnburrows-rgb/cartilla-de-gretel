const {pathToFileURL}=require('node:url');
(async()=>{
  process.send({phase:'before-import',node:process.version});
  await import(pathToFileURL(process.argv[2]).href);
  process.send({phase:'after-import'},()=>process.disconnect());
})().catch(error=>{
  process.send({phase:'import-error',message:error.stack},()=>{process.disconnect();process.exitCode=1;});
});
