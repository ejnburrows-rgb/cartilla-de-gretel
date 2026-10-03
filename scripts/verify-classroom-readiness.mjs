/** Browser verification on Node 24 without the TS/ESM loader. No live data writes. */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
const temporary = mkdtempSync(resolve(tmpdir(), 'cartilla-readiness-'));
try {
  await build({entryPoints:['tests/e2e/classroom-readiness.spec.ts','tests/e2e/classroom-readiness-gated.spec.ts','tests/e2e/activity-completion-foundation.spec.ts'],bundle:true,platform:'node',format:'cjs',external:['@playwright/test'],outdir:temporary,outExtension:{'.js':'.cjs'}});
  const server = (port, gated) => ({command:`${gated?'VITE_CRM_REVIEW=false':'VITE_ALLOW_DEMO_MODE=true'} VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_e2e_not_a_real_key node node_modules/vite/bin/vite.js --port ${port} --host 127.0.0.1`,url:`http://127.0.0.1:${port}`,timeout:60000});
  const config = {testDir:temporary,testMatch:'**/*.spec.cjs',reporter:'list',timeout:30000,fullyParallel:true,use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1280,height:900},launchOptions:{args:['--no-sandbox']}},projects:[{name:'chromium',testIgnore:'**/classroom-readiness-gated.spec.cjs'},{name:'chromium-login-gated',testMatch:'**/classroom-readiness-gated.spec.cjs',use:{baseURL:'http://127.0.0.1:5174'}}],webServer:[server(5173,false),server(5174,true)]};
  const configPath = resolve('playwright.readiness.generated.cjs');
  writeFileSync(configPath,`module.exports = ${JSON.stringify(config)};`);
  try {
    const result = spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','-c',configPath,...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,NODE_PATH:resolve('node_modules'),NO_PROXY:'127.0.0.1,localhost',no_proxy:'127.0.0.1,localhost'}});
    process.exitCode = result.status ?? 1;
  } finally {rmSync(configPath,{force:true});}
} finally {rmSync(temporary,{recursive:true,force:true});}
