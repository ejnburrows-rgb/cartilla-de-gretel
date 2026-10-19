import { chromium } from "/home/sandbox/repo/node_modules/@playwright/test/index.mjs";
import fs from "fs";
const [,, tag, outdir, ...ls] = process.argv;
fs.mkdirSync(outdir,{recursive:true});
const pg={16:[46,46],1:[1,3],2:[4,6],3:[7,9],4:[10,12],5:[13,15],6:[16,18],7:[19,22]};
const vps={desktop:[1440,900],tablet:[1280,800],phone:[390,844],phoneland:[844,390]};
const b=await chromium.launch({executablePath:"/usr/bin/google-chrome",args:["--no-sandbox"]});
const res=[];
for(const l of ls){ for(const [n,[w,h]] of Object.entries(vps)){
 const p=await b.newPage({viewport:{width:w,height:h}});
 await p.goto(`http://127.0.0.1:5199/cartilla/leccion/${l}`,{waitUntil:"networkidle"}).catch(()=>{});
 await p.waitForTimeout(1200);
 await p.waitForTimeout(2500);
 const [a,z]=pg[l];
 for(let pn=a;pn<=z;pn++){
  const idx=pn-a;
  await p.evaluate(([l,idx])=>{for(const k of Object.keys(localStorage)){if(k.endsWith(":"+l)&&/resume/i.test(k))localStorage.setItem(k,JSON.stringify({lesson:+l,page:idx}));}},[l,idx]);
  await p.reload({waitUntil:"networkidle"}).catch(()=>{});await p.waitForTimeout(1200);
  const o=await p.evaluate(()=>{const d=document.documentElement;let clip=[];document.querySelectorAll("button,img,input,canvas,[role=button]").forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0&&(r.right>innerWidth+1||r.left<-1))clip.push((e.className||e.tagName).toString().slice(0,40))});return{sw:d.scrollWidth,cw:d.clientWidth,clip:clip.slice(0,5),pg:(document.body.innerText.match(/Página \d+/)||[""])[0]}});
  const f=`${outdir}/${tag}-p${String(pn).padStart(2,"0")}-L${l}-${n}.png`;
  await p.screenshot({path:f});
  res.push({l,pn,n,...o});
 }
 await p.close();}}
await b.close();
fs.writeFileSync(`${outdir}/${tag}-metrics-${ls.join("")}.json`,JSON.stringify(res));
console.log(res.filter(r=>r.sw>r.cw||r.clip.length||r.pg!=="Página "+r.pn).map(r=>JSON.stringify(r)).join("\n")||"no overflow, pages ok");
