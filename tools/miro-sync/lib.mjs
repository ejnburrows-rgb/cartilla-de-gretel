import { createHmac, timingSafeEqual, createHash } from 'node:crypto';

const BOARD_ID='uXjVEeJX2VM=';
const REPO='ejnburrows-rgb/cartilla-de-gretel';
const FRAMES={
  'workbook-ready':'3458764686187995492','needs-processing':'3458764686187995493','needs-source-verification':'3458764686187995494','currently-used':'3458764686187995495','flipchart-only':'3458764686187995496','unused':'3458764686187995497','superseded-wrong':'3458764686187995498','delete-candidates':'3458764686187995499','open-work':'3458764686187995500','current-prs':'3458764686187995501','blockers':'3458764686187995502','sync-status':'3458764686187995503'
};
const PR_ACTIONS=new Set(['opened','edited','synchronize','reopened','closed','ready_for_review','converted_to_draft']);
const ISSUE_ACTIONS=new Set(['opened','edited','reopened','closed','labeled','unlabeled','assigned','unassigned','milestoned','demilestoned']);
const UNKNOWN_RE=/(UNKNOWN|AWAITING|PENDING|UNVERIFIED|MISSING)/i;
const BLOCKER_RE=/(block(?:ed|er|ing)?|external dependency|owner-approved|needs emilio|waiting for|cannot proceed|must wait)/i;
const KEY_RE=/\[cartilla-sync:key=([^\]]+)\]/, HASH_RE=/\[cartilla-sync:hash=([^\]]+)\]/, LEDGER_RE=/\[cartilla-sync:deliveries=([^\]]*)\]/;
const arr=v=>Array.isArray(v)?v:[];
const stableKey=(kind,id)=>`cartilla-sync:${kind}:${id}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

export function verifyGitHubSignature(body,signature,secret){
  if(!body||!signature||!secret||!signature.startsWith('sha256=')) return false;
  const expected='sha256='+createHmac('sha256',secret).update(body).digest('hex');
  const a=Buffer.from(expected),b=Buffer.from(signature); return a.length===b.length&&timingSafeEqual(a,b);
}
export function isRelevantGitHubEvent(event,payload={}){
  if(event==='push') return payload.ref==='refs/heads/main';
  if(event==='pull_request') return PR_ACTIONS.has(payload.action);
  if(event==='issues') return ISSUE_ACTIONS.has(payload.action);
  return false;
}
function rememberDelivery(current=[],id,max=50){const ledger=arr(current).slice();if(!id)return{duplicate:false,ledger:ledger.slice(-max)};if(ledger.includes(id))return{duplicate:true,ledger};ledger.push(id);return{duplicate:false,ledger:ledger.slice(-max)};}
function hashItem(item){return createHash('sha256').update(JSON.stringify(item)).digest('hex').slice(0,16);}
function parseMeta(description=''){return{key:description.match(KEY_RE)?.[1]??null,hash:description.match(HASH_RE)?.[1]??null,ledger:(description.match(LEDGER_RE)?.[1]??'').split(',').filter(Boolean)};}
function trim(s,max=900){s=String(s??'').replace(/\s+/g,' ').trim();return s.length>max?s.slice(0,max-1)+'…':s;}

async function githubFetch(url,{json=false,token}={}){
  const headers={'User-Agent':'cartilla-miro-sync','Accept':json?'application/vnd.github+json':'text/plain'}; if(token)headers.Authorization=`Bearer ${token}`;
  const res=await fetch(url,{headers}); if(!res.ok)throw new Error(`GitHub ${res.status} ${url}`); return json?res.json():res.text();
}
async function rawFile(repo,path,token){return githubFetch(`https://raw.githubusercontent.com/${repo}/main/${path}`,{token});}
async function rawJson(repo,path,token){return JSON.parse(await rawFile(repo,path,token));}
function collectRefs(value,into=new Set()){
  if(typeof value==='string'){if(/^\/cartilla\/art\/faithful\/.+\.webp$/i.test(value))into.add(value);return into;}
  if(Array.isArray(value)){for(const x of value)collectRefs(x,into);return into;}
  if(value&&typeof value==='object')for(const v of Object.values(value))collectRefs(v,into);return into;
}
async function collectWiredSrcs(repo,token){
  const into=new Set(); const paths=['src/content/consonants.json','src/content/lessons.json','src/data/page-layouts.json'];
  for(const j of await Promise.all(paths.map(p=>rawJson(repo,p,token))))collectRefs(j,into);
  const gallery=await rawFile(repo,'src/content/animal-gallery.ts',token).catch(()=>''); const re=/["'`]((?:\/cartilla\/art\/faithful\/)[^"'`]+\.webp)["'`]/g; let m; while((m=re.exec(gallery)))into.add(m[1]); return into;
}
async function readRepositoryState(repo,token){
  const pulls=`https://api.github.com/repos/${repo}/pulls?state=open&per_page=100&sort=updated&direction=desc`;
  const issuesUrl=`https://api.github.com/repos/${repo}/issues?state=open&per_page=100&sort=updated&direction=desc`;
  const [delivery,faithful,quarantine,planText,wiredSrcs,prs,issuesRaw]=await Promise.all([
    rawJson(repo,'public/cartilla/art/delivery/manifest.json',token),rawJson(repo,'public/cartilla/art/faithful/manifest.json',token),rawJson(repo,'public/cartilla/art/faithful/quarantine.json',token),rawFile(repo,'tasks/plan.md',token),collectWiredSrcs(repo,token),githubFetch(pulls,{json:true,token}),githubFetch(issuesUrl,{json:true,token})
  ]);
  return{delivery,faithful,quarantine,planText,wiredSrcs,prs,issues:issuesRaw.filter(x=>!x.pull_request)};
}
function assetBucket(asset,entry,wired,quarantineSet){
  const src=asset?.canonicalSrc??entry?.src??'',provenance=asset?.provenanceStatus??entry?.provenanceStatus??'',cleanup=asset?.cleanup??{};
  if(arr(asset?.errors).length||quarantineSet.has(src)||/SUPERSEDED|WRONG|FAIL/i.test(provenance))return'superseded-wrong';
  if(UNKNOWN_RE.test(provenance))return'needs-source-verification';
  if(asset&&(arr(asset.warnings).length||!cleanup.backgroundRemoved||!cleanup.transparentPaddingTrimmed||!arr(asset.derivatives).length))return'needs-processing';
  if((/flipchart/i.test(src)||entry?.sourceFlipchartPage)&&!wired)return'flipchart-only';
  if(wired&&asset)return'workbook-ready'; if(wired)return'currently-used'; if(!asset&&entry)return'unused'; return'delete-candidates';
}
function repoUrl(repo,path){return`https://github.com/${repo}/blob/main/${String(path).replace(/^\//,'')}`;}
function rawUrl(repo,path){return`https://raw.githubusercontent.com/${repo}/main/${String(path).replace(/^\//,'')}`;}
function buildModel({delivery={},faithful=[],quarantine={},wiredSrcs=new Set(),prs=[],issues=[],planText='',repo}){
  const deliveryBy=new Map(arr(delivery.assets).map(a=>[a.canonicalSrc,a])),faithfulBy=new Map(arr(faithful).filter(e=>e?.src).map(e=>[e.src,e]));
  const qe=arr(quarantine.assets),qs=new Set(qe.map(x=>x?.src).filter(Boolean)),qb=new Map(qe.map(x=>[x.src,x])); const sources=new Set([...deliveryBy.keys(),...faithfulBy.keys(),...qs]); const assets=[];
  for(const src of sources){
    const a=deliveryBy.get(src),q=qb.get(src),e=faithfulBy.get(src)??q?.original_manifest_entry??q,wired=wiredSrcs.has(src),bucket=assetBucket(a,e,wired,qs); const name=a?.word??a?.slug??e?.word??e?.slug??src.split('/').pop()?.replace(/\.webp$/i,'')??src;
    const file=(a?.canonicalSrc??e?.src??src).replace(/^\//,'public/'),book=/flipchart/i.test(src)||e?.sourceFlipchartPage?'Flip Chart':'Workbook',page=a?.sourcePage??e?.sourcePage??e?.sourceFlipchartPage??a?.pageNumber??e?.pageNumber??null,optimized=Boolean(a?.derivatives?.length);
    assets.push({key:stableKey('asset',src),type:'asset',bucket,title:name,sourceBook:book,sourcePage:page,currentRepoFile:file,optimized,processing:a?[a.cleanup?.backgroundRemoved?'background removed':'background pending',a.cleanup?.transparentPaddingTrimmed?'trimmed':'trim pending',a.canonical?.hasAlpha?'alpha':'opaque'].join(' · '):'not processed',workbookCounterpart:e?.workbookCounterpart??e?.counterpart??(book==='Workbook'?file:'None recorded'),currentUsage:wired?'Workbook production':(book==='Flip Chart'?'Flip Chart only':'Not currently wired'),readiness:bucket==='workbook-ready'?'Ready':bucket.replaceAll('-',' '),provenance:a?.provenanceStatus??e?.provenanceStatus??(q?'QUARANTINED':'Not recorded'),githubUrl:repoUrl(repo,file),thumbnailUrl:a?.derivatives?.[0]?.path?rawUrl(repo,`public${a.derivatives[0].path}`):rawUrl(repo,file),reason:q?.reason??null});
  }
  for(const c of arr(delivery?.flipchart?.nativeCrops))if(c?.src)assets.push({key:stableKey('flipchart-asset',c.src),type:'asset',bucket:'flipchart-only',title:c.word??c.src.split('/').pop(),sourceBook:'Flip Chart',sourcePage:c.page??null,currentRepoFile:String(c.src).replace(/^\//,'public/'),optimized:true,processing:c.backgroundRemoved===false?'background pending':'native crop ready',workbookCounterpart:'None recorded',currentUsage:'Flip Chart only',readiness:'Flip Chart ready',provenance:'Repository-controlled Flip Chart source',githubUrl:repoUrl(repo,String(c.src).replace(/^\//,'public/')),thumbnailUrl:rawUrl(repo,String(c.src).replace(/^\//,'public/'))});
  const prItems=arr(prs).map(p=>({key:stableKey('pr',p.number),type:'pr',bucket:'current-prs',title:`PR #${p.number}: ${p.title}`,description:p.body??'',githubUrl:p.html_url,draft:Boolean(p.draft)}));
  const work=arr(issues).map(i=>({key:stableKey('issue',i.number),type:'issue',bucket:'open-work',title:`#${i.number}: ${i.title}`,description:i.body??'',githubUrl:i.html_url})); const blockers=[];
  for(const i of arr(issues)){const h=`${i.title??''}\n${i.body??''}\n${arr(i.labels).map(x=>typeof x==='string'?x:x?.name).join(' ')}`;if(BLOCKER_RE.test(h))blockers.push({key:stableKey('blocker',`issue:${i.number}`),type:'blocker',bucket:'blockers',title:`#${i.number}: ${i.title}`,description:i.body??'',githubUrl:i.html_url});}
  for(const p of arr(prs)){const h=`${p.title??''}\n${p.body??''}`;if(BLOCKER_RE.test(h))blockers.push({key:stableKey('blocker',`pr:${p.number}`),type:'blocker',bucket:'blockers',title:`PR #${p.number}: ${p.title}`,description:p.body??'',githubUrl:p.html_url});}
  if(/block/i.test(planText)&&!blockers.length)blockers.push({key:stableKey('blocker','plan'),type:'blocker',bucket:'blockers',title:'Current plan contains blocking work',description:'See tasks/plan.md',githubUrl:`https://github.com/${repo}/blob/main/tasks/plan.md`}); return{assets,work,prs:prItems,blockers};
}
async function miro(path,{method='GET',token,body,retries=5}={}){
  const res=await fetch(`https://api.miro.com/v2${path}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  if(res.status===429&&retries>0){await sleep(Math.max(250,Number(res.headers.get('retry-after')||1)*1000));return miro(path,{method,token,body,retries:retries-1});}
  if(!res.ok)throw new Error(`Miro ${res.status}: ${(await res.text()).slice(0,600)}`); return res.status===204?null:res.json();
}
async function listCards(boardId,token){const out=[];for(const frameId of Object.values(FRAMES)){let cursor='';do{const q=new URLSearchParams({parent_item_id:frameId,type:'app_card',limit:'50'});if(cursor)q.set('cursor',cursor);const page=await miro(`/boards/${encodeURIComponent(boardId)}/items?${q}`,{token});for(const item of page.data??[]){const m=parseMeta(item.data?.description??'');if(m.key)out.push({...item,key:m.key,syncHash:m.hash,ledger:m.ledger});}cursor=page.cursor??'';}while(cursor);}return out;}
function colorFor(i){if(i.bucket==='workbook-ready')return'#2dc75c';if(['superseded-wrong','delete-candidates','blockers'].includes(i.bucket))return'#ff6464';if(['needs-processing','needs-source-verification'].includes(i.bucket))return'#fe9f4d';if(['current-prs','open-work'].includes(i.bucket))return'#8f7fee';return'#659df2';}
function fields(i){if(i.type==='asset')return[{value:i.sourcePage?`${i.sourceBook} p.${i.sourcePage}`:i.sourceBook,...(i.thumbnailUrl?{iconUrl:i.thumbnailUrl,iconShape:'square',tooltip:'Asset thumbnail'}:{})},{value:i.optimized?'Optimized':'Not optimized'},{value:i.readiness}];if(i.type==='pr')return[{value:i.draft?'Draft':'Open'}];if(i.type==='issue')return[{value:'Open'}];if(i.type==='blocker')return[{value:'Blocker'}];return[];}
function description(i,h,extra=''){const meta=`[cartilla-sync:key=${i.key}] [cartilla-sync:hash=${h}]`;if(i.type==='asset')return`${meta}\n${i.githubUrl}\nSource: ${i.sourceBook}${i.sourcePage?` · ${i.sourcePage}`:''}\nRepo: ${i.currentRepoFile}\nOptimized: ${i.optimized?'yes':'no'}\nProcessing: ${i.processing}\nWorkbook counterpart: ${i.workbookCounterpart}\nUsage: ${i.currentUsage}\nReadiness: ${i.readiness}\nProvenance: ${i.provenance}${i.reason?`\nReason: ${trim(i.reason,300)}`:''}${extra}`;return`${meta}\n${i.githubUrl??''}\n${trim(i.description,1200)}${extra}`;}
function grid(index){const cols=7;return{x:40+(index%cols)*400+180,y:80+Math.floor(index/cols)*145+60,origin:'center',relativeTo:'parent_top_left'};}
async function createCard(boardId,token,item,parentId,index){const h=hashItem(item);return miro(`/boards/${encodeURIComponent(boardId)}/app_cards`,{method:'POST',token,body:{data:{title:trim(item.title,180),description:description(item,h),status:'connected',fields:fields(item)},style:{fillColor:colorFor(item)},parent:{id:parentId},position:grid(index),geometry:{width:360}}});}
async function updateCard(boardId,token,id,item){const h=hashItem(item);return miro(`/boards/${encodeURIComponent(boardId)}/app_cards/${id}`,{method:'PATCH',token,body:{data:{title:trim(item.title,180),description:description(item,h),status:'connected',fields:fields(item)},style:{fillColor:colorFor(item)}}});}
async function disableCard(boardId,token,id,key){return miro(`/boards/${encodeURIComponent(boardId)}/app_cards/${id}`,{method:'PATCH',token,body:{data:{title:'Removed or superseded in GitHub',description:`[cartilla-sync:key=${key}] [cartilla-sync:hash=disabled]\nThis source item is no longer present in the current GitHub-derived dashboard model. The card is retained instead of deleted.`,status:'disabled'},style:{fillColor:'#b0b0b0'}}});}
async function writeState(boardId,token,card,ledger,counts,trigger){const key='cartilla-sync:state:main',h=hashItem({counts,trigger}),extra=`\n[cartilla-sync:deliveries=${ledger.slice(-50).join(',')}]\nLast trigger: ${trigger}\nCounts: ${Object.entries(counts).map(([k,v])=>`${k}=${v}`).join(' · ')}\nUpdated: ${new Date().toISOString()}`,body={data:{title:'GitHub → Miro sync healthy',description:description({key,type:'state',githubUrl:`https://github.com/${REPO}`,description:''},h,extra),status:'connected',fields:[{value:`${counts.assets} assets`},{value:`${counts.prs} PRs`},{value:`${counts.blockers} blockers`}]},style:{fillColor:'#659df2'}};if(card)return miro(`/boards/${encodeURIComponent(boardId)}/app_cards/${card.id}`,{method:'PATCH',token,body});return miro(`/boards/${encodeURIComponent(boardId)}/app_cards`,{method:'POST',token,body:{...body,parent:{id:FRAMES['sync-status']},position:grid(0),geometry:{width:520}}});}

export async function reconcile({trigger='manual',deliveryId=null}={}){
  const token=process.env.MIRO_ACCESS_TOKEN;if(!token)throw new Error('MIRO_ACCESS_TOKEN is not configured');const boardId=process.env.MIRO_BOARD_ID||BOARD_ID,repo=process.env.GITHUB_REPO||REPO,existing=await listCards(boardId,token),state=existing.find(x=>x.key==='cartilla-sync:state:main');let ledger=state?.ledger??[];
  if(deliveryId){const r=rememberDelivery(ledger,deliveryId);if(r.duplicate)return{ok:true,duplicate:true,deliveryId};ledger=r.ledger;}
  const model=buildModel({...await readRepositoryState(repo,process.env.GITHUB_TOKEN),repo}),desired=[...model.assets,...model.work,...model.prs,...model.blockers],byKey=new Map(existing.filter(x=>x.key&&x.key!=='cartilla-sync:state:main').map(x=>[x.key,x])),desiredKeys=new Set(desired.map(x=>x.key)),indices=new Map();let created=0,updated=0,disabled=0,unchanged=0;
  const idx=b=>{const n=indices.get(b)??0;indices.set(b,n+1);return n;};
  for(const item of desired){const old=byKey.get(item.key),index=idx(item.bucket);if(!old){await createCard(boardId,token,item,FRAMES[item.bucket],index);created++;}else if(old.syncHash===hashItem(item))unchanged++;else{await updateCard(boardId,token,old.id,item);updated++;}}
  for(const old of byKey.values())if(!desiredKeys.has(old.key)){await disableCard(boardId,token,old.id,old.key);disabled++;}
  const counts={assets:model.assets.length,work:model.work.length,prs:model.prs.length,blockers:model.blockers.length,created,updated,disabled,unchanged};await writeState(boardId,token,state,ledger,counts,trigger);return{ok:true,duplicate:false,counts};
}
