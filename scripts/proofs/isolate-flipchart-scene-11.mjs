// Native-source extraction; never redraw or resample foreground artwork.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const source='public/cartilla/art/hd/flipchart/page-011.jpg';
const destination='public/cartilla/art/optimized/flipchart-native/p011-scene.png';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceBytes=await fs.readFile(source);
const expected='e58fe24fd1b76295765f3e01f81ad15b6ff7f30db41201ad5532242d8976896c';
assert.equal(sha(sourceBytes),expected,'Original source changed; inspect before extracting');
const rectangle={left:690,top:450,width:1680,height:1370};
const {data,info}=await sharp(sourceBytes).extract(rectangle).ensureAlpha().raw().toBuffer({resolveWithObject:true});
// The neighboring Mm letter halo occupies the upper-left corner, outside the
// mother/child, decorative dots and complete flower border. Mask only that
// unrelated rectangular area. Retain all RGB samples and all other alpha bytes.
const masked=Buffer.from(data);
for(let y=0;y<900;y++)for(let x=0;x<250;x++)masked[(y*info.width+x)*4+3]=0;
const png=await sharp(masked,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
const decoded=await sharp(png).raw().toBuffer();
assert.equal(decoded.length,data.length);
for(let i=0;i<data.length;i++){
 const pixel=Math.floor(i/4),x=pixel%info.width,y=Math.floor(pixel/info.width);
 assert.equal(decoded[i],i%4===3&&x<250&&y<900?0:data[i],`Unexpected source change at sample ${i}`);
}
if(process.argv.includes('--write'))await fs.writeFile(destination,png);
else assert.deepEqual(await sharp(destination).raw().toBuffer(),decoded,'Installed scene differs from exact extraction');
const proof={source,sourceSha256:expected,destination,sha256:sha(png),nativeCropLTRB:[690,450,2370,1820],dimensions:[1680,1370],alphaOnlyExclusion:{relativeLTRB:[0,0,250,900],reason:'Neighboring Mm letter/halo, outside all scene foreground'},retainedRGBSamplesUnchanged:true,allOtherAlphaUnchanged:true,resampled:false};
const proofDir='docs/proofs/source-crop-repairs-2026-10-27/scene-11';await fs.mkdir(proofDir,{recursive:true});await fs.writeFile(proofDir+'/source.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
