/** Browser verification on Node 24 without the TS/ESM loader. No live data writes. */
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

/**
 * Playwright resolves webServer `command`/`cwd` relative to the config file's
 * directory, so the generated config must stay in the repository root for the
 * `node_modules` resolution and repository cwd the harness relies on.
 * A unique per-run name keeps concurrent invocations from sharing one file.
 */
export const createReadinessRunId = () => `${process.pid}-${randomUUID()}`;

export const readinessConfigFileName = (runId) => `playwright.readiness.generated.${runId}.cjs`;

export const readinessConfigPath = (runId) => resolve(readinessConfigFileName(runId));

export const createReadinessConfig = (testDir) => {
  const server = (port, gated) => ({command:`${gated?'VITE_CRM_REVIEW=false':'VITE_ALLOW_DEMO_MODE=true'} VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_e2e_not_a_real_key node node_modules/vite/bin/vite.js --port ${port} --host 127.0.0.1`,url:`http://127.0.0.1:${port}`,timeout:60000});
  return {testDir,testMatch:'**/*.spec.cjs',reporter:'list',timeout:30000,fullyParallel:true,use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1280,height:900},launchOptions:{args:['--no-sandbox']}},projects:[{name:'chromium',testIgnore:'**/classroom-readiness-gated.spec.cjs'},{name:'chromium-login-gated',testMatch:'**/classroom-readiness-gated.spec.cjs',use:{baseURL:'http://127.0.0.1:5174'}}],webServer:[server(5173,false),server(5174,true)]};
};

export const writeReadinessConfig = (config, runId) => {
  const configPath = readinessConfigPath(runId);
  writeFileSync(configPath,`module.exports = ${JSON.stringify(config)};`);
  return configPath;
};

export const removeReadinessConfig = (configPath) => { rmSync(configPath,{force:true}); };

export async function runReadiness() {
  const { build } = await import('esbuild');
  const temporary = mkdtempSync(resolve(tmpdir(), 'cartilla-readiness-'));
  try {
    await build({entryPoints:['tests/e2e/classroom-readiness.spec.ts','tests/e2e/classroom-readiness-gated.spec.ts','tests/e2e/activity-completion-foundation.spec.ts','tests/e2e/crm-local-demo.spec.ts'],bundle:true,platform:'node',format:'cjs',external:['@playwright/test'],outdir:temporary,outExtension:{'.js':'.cjs'}});
    const configPath = writeReadinessConfig(createReadinessConfig(temporary), createReadinessRunId());
    try {
      const result = spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','-c',configPath,...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,NODE_PATH:resolve('node_modules'),NO_PROXY:'127.0.0.1,localhost',no_proxy:'127.0.0.1,localhost'}});
      process.exitCode = result.status ?? 1;
    } finally {removeReadinessConfig(configPath);}
  } finally {rmSync(temporary,{recursive:true,force:true});}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {await runReadiness();}
