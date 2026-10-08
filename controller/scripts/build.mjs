import {readdir,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
async function check(dir){for(const name of await readdir(dir)){const p=`${dir}/${name}`;if((await stat(p)).isDirectory())await check(p);else if(p.endsWith('.mjs'))execFileSync(process.execPath,['--check',p]);}}
await check('src');await check('api');await import('../src/functions.mjs');console.log('Production entrypoints and Inngest functions build successfully');
