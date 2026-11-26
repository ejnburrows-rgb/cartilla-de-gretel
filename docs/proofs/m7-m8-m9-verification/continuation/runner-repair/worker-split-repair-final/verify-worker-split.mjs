import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {createServer} from 'vite';

const keepAlive=setInterval(()=>{},1000);
const watchdog=setTimeout(()=>{console.error('Diagnostic exceeded 120s');process.exit(124)},120000);
const root=process.cwd();
const output=path.join(root,'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/worker-split-repair-final');
fs.mkdirSync(output,{recursive:false});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const git=['C:/Program Files/Git/cmd/git.exe','C:/Program Files/Git/bin/git.exe','/usr/bin/git','/usr/local/bin/git','/opt/homebrew/bin/git'].find(c=>fs.existsSync(c));if(!git)throw Error('Git executable not found at a fixed absolute location');
const require=createRequire(import.meta.url);
const lexerPath=require.resolve('es-module-lexer',{paths:[path.dirname(require.resolve('vitest/package.json'))]});
const {init,parse}=await import(pathToFileURL(lexerPath).href);await init;
const tracked=execFileSync(git,['ls-files','-z','--','src/routes','src/routeTree.gen.ts'],{encoding:'utf8'}).split('\0').filter(Boolean);
const capture=()=>Object.fromEntries(tracked.map(name=>{
 const file=path.join(root,name);
 return [name,{sha256:sha(fs.readFileSync(file)),mtimeMs:fs.statSync(file).mtimeMs}];
}));
const before=capture();
const ids=text=>[...text.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map(match=>match[1]).sort();
const committedTree=fs.readFileSync(path.join(root,'src/routeTree.gen.ts'),'utf8');
const record={head:execFileSync(git,['rev-parse','HEAD'],{encoding:'utf8'}).trim(),startedUtc:new Date().toISOString(),before,lanes:[]};
const save=()=>fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(record,null,2)+'\n');save();
for(const lane of ['open','gated']){
 process.env.VITE_CRM_REVIEW=lane==='gated'?'false':'true';
 process.env.VITE_SUPABASE_URL='http://127.0.0.1:54321';
 process.env.VITE_SUPABASE_PUBLISHABLE_KEY='sb_publishable_e2e_not_a_real_key';
 let server;
 const item={lane,checks:[]};record.lanes.push(item);save();
 try{
  server=await createServer({mode:'worker',server:{middlewareMode:true},optimizeDeps:{noDiscovery:true,include:[]}});
  // Transform-only diagnostic: no HTTP listener or dependency crawl is needed.
  item.plugins=server.config.plugins.map(plugin=>plugin.name).filter(name=>name.includes('router'));
  item.optimizerOverride='Transform-only: noDiscovery=true/include=[]; actual browser gate retains original optimizer';
  for(const [name,url,forbidden] of [['welcome','/src/routes/entrar.tsx','WelcomeSplash'],['workbook','/src/routes/cartilla/cuaderno.tsx','NativeLessonViewer']]){
   const transformed=await server.transformRequest(url);
   if(!transformed)throw Error('Missing transform '+url);
   fs.writeFileSync(path.join(output,`${lane}-${name}.js`),transformed.code);
   const [imports]=parse(transformed.code);
   const staticImports=imports.filter(item=>item.d===-1).map(item=>item.n);
   const check={name,url,staticImports,lazyComponent:transformed.code.includes('tsr-split'),forbiddenStaticImport:staticImports.some(specifier=>specifier?.includes(forbidden))};
   item.checks.push(check);
   if(!check.lazyComponent||check.forbiddenStaticImport)throw Error('Worker retained eager component '+name);
  }
  const generated=path.join(root,'work/router-worker',lane,'routeTree.gen.ts');
  item.generatedTree=path.relative(root,generated);
  item.routeIdsMatch=JSON.stringify(ids(fs.readFileSync(generated,'utf8')))===JSON.stringify(ids(committedTree));
  if(!item.routeIdsMatch)throw Error('Worker route IDs differ from committed tree');
  item.passed=true;
 }catch(error){item.error=error.stack;item.passed=false;save();}
 finally{save();await server?.close();save();}
}
record.after=capture();
record.changedRoutes=tracked.filter(name=>record.before[name].sha256!==record.after[name].sha256);
record.rewrittenRoutes=tracked.filter(name=>record.before[name].mtimeMs!==record.after[name].mtimeMs);
record.finishedUtc=new Date().toISOString();
record.passed=record.lanes.every(lane=>lane.passed)&&record.changedRoutes.length===0&&record.rewrittenRoutes.length===0;save();
console.log(JSON.stringify({passed:record.passed,lanes:record.lanes,changedRoutes:record.changedRoutes,rewrittenRoutes:record.rewrittenRoutes},null,2));
clearInterval(keepAlive);clearTimeout(watchdog);
// Both awaited Vite close calls completed. Imported plugin watchers can retain
// the transform-only Node process; end this standalone diagnostic explicitly.
record.activeResourcesAfterClose=process.getActiveResourcesInfo();save();
process.exit(record.passed?0:1);
