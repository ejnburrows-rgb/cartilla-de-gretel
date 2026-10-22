/** Evidence qualifier, not an automated identity/fidelity verdict.
 * Sharpness screen calibrated against the owner's arbol regression pair.
 * A passing screen alone NEVER grants a visual PASS.
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
export const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
export async function screenSharpness(file) {
  const {data,info}=await sharp(file).resize(320,320,{fit:'contain',background:'#ffffff'}).flatten({background:'#ffffff'}).removeAlpha().raw().toBuffer({resolveWithObject:true});
  let residual=0,strongEdges=0,n=0;
  for(let y=1;y<info.height-1;y++)for(let x=1;x<info.width-1;x++)for(let c=0;c<3;c++){
    const i=(y*info.width+x)*3+c;
    const neighbors=[data[i-3],data[i+3],data[i-info.width*3],data[i+info.width*3]].sort((a,b)=>a-b);
    const delta=Math.abs(data[i]-(neighbors[1]+neighbors[2])/2);
    residual+=Math.min(delta,30);if(delta>30)strongEdges++;n++;
  }
  // Fine pixel noise relative to coherent strong contours. No upscaling rescue:
  // enlarged scan pixels keep the same poor signal at this common review size.
  const noiseToContour=(residual/n)/Math.max(strongEdges/n*1000,0.01);
  return {method:'contour-noise-screen-v1',reviewSize:320,noiseToContour,
    threshold:0.22,status:noiseToContour>0.22?'FAIL':'PASS',
    caveat:'Pair-calibrated sharpness screen; cannot prove picture identity, completeness, or book fidelity.'};
}
export async function qualifyVisualEvidence({file,technicalPass=false,comparison}) {
  const assetSha256=sha256(file);const sharpness=await screenSharpness(file);
  const lookCompared=Boolean(comparison?.reviewed===true&&comparison.assetSha256===assetSha256&&comparison.sourceSha256&&comparison.evidencePath&&existsSync(comparison.evidencePath)&&comparison.reviewer&&comparison.verdict==='MATCH');
  const visualPass=technicalPass&&sharpness.status==='PASS'&&lookCompared;
  return {assetSha256,technicalStatus:technicalPass?'PASS':'NOT VERIFIED',sharpness,lookCompared,
    fidelityStatus:visualPass?'VISUALLY REVIEWED MATCH':'fidelity NOT verified',
    label:visualPass?'Technical PASS; sharpness screen PASS; look comparison MATCH':`Technical ${technicalPass?'PASS':'NOT VERIFIED'}; fidelity NOT verified`,
    blockers:[...(sharpness.status==='FAIL'?['Jagged/low-sharpness screen failed']:[]),...(!lookCompared?['Missing current-hash-bound look comparison evidence']:[])]};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const file=process.argv[2];if(!file)throw new Error('Usage: node scripts/check-art-visual-evidence.mjs IMAGE [COMPARISON_JSON]');
 const comparison=process.argv[3]?JSON.parse(readFileSync(process.argv[3],'utf8')):undefined;
 const result=await qualifyVisualEvidence({file,technicalPass:true,comparison});console.log(JSON.stringify(result,null,2));
 if(result.sharpness.status==='FAIL')process.exitCode=1;
}
