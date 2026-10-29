import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function motionArtFreshness(){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'scripts/living-motion/manifest.json'),'utf8'));
 const stale={};
 for(const [name,m] of Object.entries(manifest)){
  const p=path.join(root,m.still);
 const bytes=fs.existsSync(p)?fs.readFileSync(p):null;
 // SVGs are text; Windows may checkout CRLF while Git and the motion manifest record LF bytes.
 const canonical=bytes && path.extname(p).toLowerCase()==='.svg'
  ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'),'utf8') : bytes;
 const current=canonical?crypto.createHash('sha256').update(canonical).digest('hex'):null;
  if(current!==m.stillSha256)stale['/'+m.still.replace(/^public\//,'')]={name,currentSha256:current,builtFromSha256:m.stillSha256,blockedAlive:'/'+m.alive.replace(/^public\//,''),motionStatus:m.motionStatus||'NOT VERIFIED - still replaced since motion was built'};
 }
 return stale;
}
const out=path.join(root,'src/data/stale-motion-art.json');
if(process.argv.includes('--check')){
 if(JSON.stringify(JSON.parse(fs.readFileSync(out,'utf8')))!==JSON.stringify(motionArtFreshness()))throw new Error('Stale motion index out of date; run node scripts/check-motion-art-freshness.mjs');
}else fs.writeFileSync(out,JSON.stringify(motionArtFreshness(),null,2)+'\n');
