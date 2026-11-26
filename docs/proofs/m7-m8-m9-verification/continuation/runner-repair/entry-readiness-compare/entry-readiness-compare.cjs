const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawn,execFileSync}=require('node:child_process');
const {performance}=require('node:perf_hooks');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const builtRoot='D:/Downloads/cartilla-1247-continuation-work/integration';
const base=path.join(root,'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/entry-readiness-compare');
const out=path.join(base,'output');fs.mkdirSync(out);
const raw=path.join(root,'work/entry-readiness-compare-raw');fs.mkdirSync(raw);
const node=process.execPath;
const sha=file=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const git=['C:/Program Files/Git/cmd/git.exe','C:/Program Files/Git/bin/git.exe','/usr/bin/git','/usr/local/bin/git','/opt/homebrew/bin/git'].find(c=>fs.existsSync(c));if(!git)throw Error('Git executable not found at a fixed absolute location');
const manifestPath=path.join(builtRoot,'docs/proofs/m7-m8-m9-verification/continuation/unit-runner-repair/complete-gate-324b1383/post-build-dist-manifest.json');
if(sha(manifestPath)!=='sha256:a5491bc6557dd693e2ffa5d5abc157c4afada7690f10f061e91c5b40cfc9df83')throw Error('Unexpected post-build manifest identity');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const dist=path.resolve(builtRoot,'dist');
for(const item of manifest.files){const file=path.resolve(dist,item.path);if(!file.startsWith(dist+path.sep)||sha(file)!==item.sha256)throw Error('Built artifact failed manifest validation: '+item.path);}
fs.copyFileSync(manifestPath,path.join(out,'post-build-dist-manifest.json'),fs.constants.COPYFILE_EXCL);
const artifactFiles=manifest.files.map(item=>'dist/'+item.path);
const identity=()=>Object.fromEntries(artifactFiles.map(file=>[file,sha(path.join(builtRoot,file))]));
const record={startedUtc:new Date().toISOString(),scope:'entry-only diagnosis, not full CRM phone journey',legacyStaticBuildMarker:fs.readFileSync(path.join(builtRoot,'dist/build-version.txt'),'utf8').trim(),indexModifiedUtc:fs.statSync(path.join(builtRoot,'dist/index.html')).mtime.toISOString(),builtArtifactsBefore:identity(),sourceDiff324:execFileSync(git,['diff','324b1383','HEAD','--','src','public','vite.config.ts','package.json','pnpm-lock.yaml'],{cwd:builtRoot,encoding:'utf8'}),legs:[]};
const save=()=>fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(record,null,2));save();
if(record.sourceDiff324.trim())throw Error('Built checkout app/config differs from frozen324 source');
record.manifestVerification={digest:sha(manifestPath),verifiedFiles:manifest.files.length,qualifiedSource:manifest.qualifiedSource,captureBoundary:manifest.captureBoundary};
record.developmentSourceDiff324=execFileSync(git,['diff','324b1383','HEAD','--','src','public','vite.config.ts','package.json','pnpm-lock.yaml'],{cwd:root,encoding:'utf8'});
if(record.developmentSourceDiff324.trim())throw Error('Development app/config differs from frozen324 source');save();
const now=()=>({utc:new Date().toISOString(),monotonicMs:performance.now()});
async function startServer(leg,cwd,port,preview){
 const args=[path.join(cwd,'node_modules/vite/bin/vite.js'),...(preview?['preview']:['dev']),'--mode','worker','--port',String(port),'--host','127.0.0.1','--strictPort'];
 const stdout=fs.openSync(path.join(out,leg.name+'-server-stdout.txt'),'wx');
 const stderr=fs.openSync(path.join(out,leg.name+'-server-stderr.txt'),'wx');
 const server=spawn(node,args,{cwd,env:{...process.env,VITE_ALLOW_DEMO_MODE:'true',VITE_CRM_REVIEW:'true',VITE_SUPABASE_URL:'http://127.0.0.1:54321',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_e2e_not_a_real_key'},stdio:['ignore',stdout,stderr]});
 fs.closeSync(stdout);fs.closeSync(stderr);
 leg.server={pid:server.pid,args,cwd};save();
 const deadline=Date.now()+300000;
 while(Date.now()<deadline){
  if(server.exitCode!==null)throw Error('Owned server exited before readiness: '+server.exitCode);
  try{const response=await fetch(`http://127.0.0.1:${port}`,{signal:AbortSignal.timeout(1000)});if(response.ok)return server;}catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 await stopServer(server);throw Error('Owned server readiness exceeded existing 300s ceiling');
}
async function stopServer(server){
 if(!server||server.exitCode!==null)return;
 await new Promise(resolve=>{server.once('exit',resolve);server.kill();});
}
async function runLeg(name,cwd,port,preview){
 const leg={name,started:now(),events:[],blockedBackend:[]};record.legs.push(leg);save();
 let server,browser,context;
 try{
  server=await startServer(leg,cwd,port,preview);
  browser=await chromium.launch({channel:'chromium',args:['--no-sandbox']});
  leg.browserVersion=browser.version();
  context=await browser.newContext({viewport:{width:390,height:844}});
  await context.route('**/rest/v1/**',route=>{leg.blockedBackend.push({kind:'rest',path:new URL(route.request().url()).pathname});return route.abort();});
  await context.route('**/auth/v1/**',route=>{leg.blockedBackend.push({kind:'auth',path:new URL(route.request().url()).pathname});return route.abort();});
  await context.tracing.start({screenshots:true,snapshots:true,sources:false});
  const page=await context.newPage();
  for(const event of ['domcontentloaded','load','crash'])page.on(event,()=>{leg.events.push({kind:event,...now()});save();});
  page.on('requestfailed',request=>{leg.events.push({kind:'requestfailed',path:new URL(request.url()).pathname,error:request.failure()?.errorText,...now()});save();});
  page.on('pageerror',error=>{leg.events.push({kind:'pageerror',name:error.name,message:error.message.slice(0,300),...now()});save();});
  await page.addInitScript(()=>{
   performance.setResourceTimingBufferSize(5000);
   const states=[];const ids=new WeakMap();let nextId=0,last='';
   const sample=()=>{
    const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]')].filter(node=>node.textContent?.replace(/\s+/g,' ').trim().includes('Hoy en tu clase'));
    const nodes=headings.map(node=>{
     if(!ids.has(node))ids.set(node,++nextId);
     const rect=node.getBoundingClientRect();const ancestors=[];
     for(let item=node;item;item=item.parentElement){const style=getComputedStyle(item);ancestors.push({tag:item.tagName,className:String(item.className).slice(0,180),hidden:item.hidden,inert:item.inert,ariaHidden:item.getAttribute('aria-hidden'),display:style.display,visibility:style.visibility,opacity:style.opacity,contentVisibility:style.contentVisibility});}
     return {id:ids.get(node),text:node.textContent,role:node.getAttribute('role'),ariaLabel:node.getAttribute('aria-label'),ariaLabelledby:node.getAttribute('aria-labelledby'),connected:node.isConnected,bounds:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},nativeVisibility:typeof node.checkVisibility==='function'?node.checkVisibility():null,ancestors};
    });
    const state={readyState:document.readyState,nodes};const key=JSON.stringify(state);
    if(key!==last&&states.length<1000){states.push({at:performance.now(),...state});last=key;}
   };
   const timer=setInterval(sample,50);sample();
   window.__entryReadiness={stop(){clearInterval(timer);sample();return {timeOrigin:performance.timeOrigin,now:performance.now(),states,navigation:performance.getEntriesByType('navigation').map(value=>value.toJSON()),resourceCount:performance.getEntriesByType('resource').length,resources:performance.getEntriesByType('resource').map(value=>({path:new URL(value.name).protocol.startsWith('http')?new URL(value.name).pathname:new URL(value.name).protocol,start:value.startTime,end:value.responseEnd,duration:value.duration,bytes:value.transferSize}))};}};
  });
  leg.gotoStart=now();save();
  await page.goto(`http://127.0.0.1:${port}/cartilla/teacher/crm`);
  leg.gotoEnd=now();
  leg.expectStart=now();leg.expectDeadline={utc:new Date(Date.parse(leg.expectStart.utc)+5000).toISOString(),monotonicMs:leg.expectStart.monotonicMs+5000};
  try{await expect(page.getByRole('heading',{name:'Hoy en tu clase'})).toBeVisible({timeout:5000});leg.visibilityAssertion='pass';}
  catch(error){leg.visibilityAssertion='fail';leg.assertionError=error.message;}
  leg.expectEnd=now();save();
  leg.accessibleHeadingCount=await page.getByRole('heading',{name:'Hoy en tu clase'}).count();
  leg.lifecycle=await page.evaluate(()=>window.__entryReadiness.stop());
  await page.screenshot({path:path.join(out,name+'-after-assertion.png'),fullPage:true});
 }catch(error){leg.error=String(error);leg.visibilityAssertion??='not-reached';}
 finally{
  if(context)await context.tracing.stop({path:path.join(raw,name+'-trace.zip')}).catch(error=>{leg.traceError=String(error);});
  if(browser)await browser.close().catch(error=>{leg.browserCloseError=String(error);});
  await stopServer(server);leg.finished=now();save();
 }
}
(async()=>{
 try{await runLeg('built-preview',builtRoot,5180,true);await runLeg('development',root,5173,false);}
 finally{record.builtArtifactsAfter=identity();record.builtArtifactsUnchanged=JSON.stringify(record.builtArtifactsBefore)===JSON.stringify(record.builtArtifactsAfter);record.finishedUtc=new Date().toISOString();save();console.log(JSON.stringify({legs:record.legs.map(leg=>({name:leg.name,assertion:leg.visibilityAssertion,error:leg.error})),builtArtifactsUnchanged:record.builtArtifactsUnchanged}));}
 process.exitCode=record.legs.every(leg=>leg.visibilityAssertion==='pass')&&record.builtArtifactsUnchanged?0:1;
})();
