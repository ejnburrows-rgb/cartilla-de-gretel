// Existing Gretel artwork gallery: durable, local-only review storage.
// No database, public server, external service, asset replacement or deployment.
import { createServer } from "node:http";
import { readFile, writeFile, rename, mkdir, copyFile, appendFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_STORAGE = join(homedir(), "Cartilla-Gretel", "art-review");
const MIME = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml",
  ".css":"text/css", ".ico":"image/x-icon" };
const json = value => JSON.stringify(value);
const safeId = id => typeof id === "string" && /^[A-Za-z0-9_-]{3,90}$/.test(id);
const send = (res, status, obj) => { res.writeHead(status, {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});res.end(json(obj)); };
const validDecision = value => value === null || (value && typeof value === "object" &&
  ["accepted","declined","skipped","pending"].includes(value.status) &&
  (!value.selected_candidate_id || (typeof value.selected_candidate_id === "string" && value.selected_candidate_id.length < 160)) &&
  (!value.upload_url || (typeof value.upload_url === "string" && /^\/api\/art-review\/uploads\/[a-zA-Z0-9_.-]+$/.test(value.upload_url))));
async function readBody(req, max = 20_000_000) {
  const chunks=[];let count=0;
  for await (const piece of req) { count+=piece.length; if(count>max){const error=new Error("File exceeds allowed size");error.status=413;throw error;}chunks.push(piece); }
  return Buffer.concat(chunks);
}
function within(folder, relative) {
  const abs=resolve(folder,relative);return abs===resolve(folder)||abs.startsWith(resolve(folder)+sep)?abs:null;
}
export function createArtReviewServer({ rootDir = DEFAULT_ROOT, storageDir = DEFAULT_STORAGE } = {}) {
  const stateFile=join(storageDir,"decisions.json"),historyFile=join(storageDir,"history.ndjson"),uploads=join(storageDir,"uploads");
  const boardPath=join(rootDir,"docs","art-board","verified-optimized-catalog.json");
  let mutations=Promise.resolve(), groupsPromise;
  async function groups(){ if(!groupsPromise)groupsPromise=readFile(boardPath,"utf8").then(t=>new Set(JSON.parse(t).groups.map(g=>g.group_id)));return groupsPromise; }
  async function state(){
    try { const v=JSON.parse(await readFile(stateFile,"utf8")); if(!v || typeof v.decisions!=="object" || !v.decisions || Array.isArray(v.decisions))throw Error("Damaged review state");return v; }
    catch(e){if(e.code==="ENOENT")return {version:1,decisions:{},updated_at:null};throw e;}
  }
  async function persist(next,action){
    await mkdir(storageDir,{recursive:true});
    const temp=join(storageDir, "decisions-"+process.pid+"-"+Date.now()+".tmp");
    await writeFile(temp,json(next),"utf8");
    try { await copyFile(stateFile,join(storageDir,"decisions.previous.json")); }catch(e){if(e.code!=="ENOENT")throw e;}
    await rename(temp,stateFile);
    await appendFile(historyFile,json({time:new Date().toISOString(),action})+"\n","utf8");
  }
  function change(fn){
    const job=mutations.then(fn);mutations=job.catch(()=>{});return job;
  }
  async function serveFile(res,root,relative){
    const file=within(root,relative);
    if(!file){send(res,403,{error:"Blocked path"});return;}
    try {
      const data=await readFile(file), extension=extname(file).toLowerCase();
      res.writeHead(200,{"Content-Type":MIME[extension]||"application/octet-stream","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
      res.end(data);
    }catch(e){send(res,e.code==="ENOENT"?404:500,{error:e.code==="ENOENT"?"File not found":"Cannot read file"});}
  }
  return createServer(async (req,res)=>{
    try {
      const url=new URL(req.url,"http://127.0.0.1"), path=url.pathname,method=req.method;
      if(["POST","PUT","PATCH","DELETE"].includes(method)){
        const origin=req.headers.origin;
        if(origin && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)){send(res,403,{error:"Local access only"});return;}
      }
      if(path==="/api/art-review/state" && method==="GET"){send(res,200,await state());return;}
      if(path==="/api/art-review/decision" && method==="POST"){
        const payload=JSON.parse((await readBody(req,100_000)).toString("utf8"));
        if(!safeId(payload.group_id)||!(await groups()).has(payload.group_id)||!validDecision(payload.decision)){send(res,400,{error:"Invalid review entry"});return;}
        const saved=await change(async()=>{const s=await state(); if(payload.decision===null)delete s.decisions[payload.group_id];else s.decisions[payload.group_id]=payload.decision;
          s.updated_at=new Date().toISOString();await persist(s,{kind:"decision",id:payload.group_id,value:payload.decision});return s.updated_at;});
        send(res,200,{saved:true,updated_at:saved});return;
      }
      if(path==="/api/art-review/migrate" && method==="POST"){
        const body=JSON.parse((await readBody(req,1_000_000)).toString("utf8"));
        if(!body || typeof body.decisions!=="object" || Array.isArray(body.decisions)){send(res,400,{error:"Invalid migration"});return;}
        const result=await change(async()=>{
          const s=await state(),allowed=await groups();let imported=0;
          for(const [id,d] of Object.entries(body.decisions||{})){if(allowed.has(id)&&!(id in s.decisions)&&validDecision(d)&&d!==null){s.decisions[id]=d;imported++;}}
          if(imported){s.updated_at=new Date().toISOString();await persist(s,{kind:"legacy-migration",imported});}
          return {saved:true,imported,existing:Object.keys(s.decisions).length};
        });send(res,200,result);return;
      }
      if(path==="/api/art-review/upload" && method==="POST"){
        const id=url.searchParams.get("group"),fileName=url.searchParams.get("name")||"replacement";
        if(!safeId(id)||!(await groups()).has(id)){send(res,400,{error:"Unknown illustration"});return;}
        const data=await readBody(req,20_000_000);
        const png=data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
        const jpg=data.subarray(0,3).equals(Buffer.from([255,216,255]));
        const webp=data.subarray(0,4).toString()==="RIFF"&&data.subarray(8,12).toString()==="WEBP";
        if(!(png||jpg||webp)||data.length<32){send(res,415,{error:"Upload must be a valid PNG, JPEG or WebP file"});return;}
        const ext=png?".png":jpg?".jpg":".webp",sha=createHash("sha256").update(data).digest("hex");
        const name=id+"-"+sha.slice(0,24)+ext;
        await mkdir(uploads,{recursive:true});
        try {await stat(join(uploads,name));}catch(e){if(e.code!=="ENOENT")throw e;await writeFile(join(uploads,name),data,{flag:"wx"});}
        send(res,200,{saved:true,url:"/api/art-review/uploads/"+name,sha256:sha,original_name:String(fileName).slice(0,255),bytes:data.length});return;
      }
      if(path.startsWith("/api/art-review/uploads/") && method==="GET"){
        const name=path.split("/").pop();
        if(!/^[A-Za-z0-9_-]+-[a-f0-9]{24}\.(png|jpg|webp)$/.test(name)){send(res,400,{error:"Invalid attachment"});return;}
        await serveFile(res,uploads,name);return;
      }
      if(method!=="GET"){send(res,405,{error:"Method not allowed"});return;}
      if(path==="/"){res.writeHead(302,{Location:"/art-board/verified-optimized.html"});res.end();return;}
      if(path==="/art-board/verified-optimized.html"){await serveFile(res,join(rootDir,"docs","art-board"),"verified-optimized.html");return;}
      if(path.startsWith("/cartilla/")){await serveFile(res,join(rootDir,"public"),path.slice(1));return;}
      if(path.startsWith("/art-board/")){await serveFile(res,join(rootDir,"public"),path.slice(1));return;}
      send(res,404,{error:"Not found"});
    }catch(e){send(res,e.status||500,{error:e.status?e.message:"Review storage unavailable; decisions were not saved"});}
  });
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.CARTILLA_REVIEW_PORT||5188);
  const server=createArtReviewServer({rootDir:process.env.CARTILLA_REVIEW_ROOT||DEFAULT_ROOT,storageDir:process.env.CARTILLA_REVIEW_DATA||DEFAULT_STORAGE});
  server.listen(port,"127.0.0.1",()=>console.log("Gretel artwork review: http://127.0.0.1:"+port+"/art-board/verified-optimized.html"));
}
