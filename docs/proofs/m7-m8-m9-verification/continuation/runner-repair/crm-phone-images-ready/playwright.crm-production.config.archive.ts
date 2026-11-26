import { defineConfig } from '@playwright/test';
import path from 'node:path';
import original from '../playwright.config';
const root=process.cwd();
export default defineConfig({
 ...original,
 testDir:path.join(root,'tests/e2e'),
 projects:original.projects!.filter(project=>project.name==='chromium').map(project=>({...project,use:{...project.use,baseURL:'http://127.0.0.1:5180'}})),
 webServer:{cwd:root,command:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5180 --strictPort',url:'http://127.0.0.1:5180',reuseExistingServer:false,timeout:300000},
});
