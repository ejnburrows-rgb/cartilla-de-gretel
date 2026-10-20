import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pages=JSON.parse(readFileSync(new URL('../../src/data/page-layouts.json',import.meta.url))).pages;
const root='/cartilla/art/approved/lesson-3/';
const hashes={
 'iglu.png':'89d3ba9960bb3403850ef24f302b73c2dc4fde925faab12e432903e09e27c9f7',
 'oveja.png':'29bd0e7395a644a21eff158db78bddf8af78ca1d5a3113978d9202943047ce73',
 'aro.png':'a00a15c746cf0bf8129973257112cff25d27a405da9943f9d06010d6c54c9aa8',
 'ojo.png':'88bf5607881edc8137c2f28ad849d1b9e454a49a701885c7b4d32dda3c1b1195',
 'oruga.jpg':'edfee000b2c93d7d26d7f28a1d035e262c95119f718e30130d3f4a12cdef92f8',
};
for(const [file,hash] of Object.entries(hashes)) test(`exact supplied bytes: ${file}`,()=>{
 const bytes=readFileSync(new URL(`../../public${root}${file}`,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),hash);
});
const expected={7:{oruga:'oruga.jpg',aro:'aro.png',oveja:'oveja.png',ojo:'ojo.png'},8:{'iglú':'iglu.png',aro:'aro.png'}};
for(const [page,mapping] of Object.entries(expected)) test(`Lesson 3 page ${page}: word-to-picture mapping`,()=>{
 const cells=pages[page].regions.flatMap(r=>r.cells??[]);
 for(const [word,file] of Object.entries(mapping)) assert.equal(cells.find(c=>c.caption===word)?.illustrationSrc,root+file);
});
