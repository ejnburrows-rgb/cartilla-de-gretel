const {pathToFileURL} = require('node:url');
const {performance} = require('node:perf_hooks');
const started = performance.now();
const send = (stage, extra={}) => process.send({stage, ms:performance.now()-started, ...extra});
(async()=>{
  try {
    send('child-started', {node:process.version});
    const {e:environments} = await import(pathToFileURL(process.argv[2]).href);
    send('vitest-environments-imported');
    const environment = await environments.jsdom.setup(globalThis, {});
    send('jsdom-global-setup-completed', {ready:typeof document==='object',html:document.documentElement.outerHTML});
    await environment.teardown(globalThis);
    send('jsdom-teardown-completed');
    process.exit(0);
  } catch(error) {send('error',{message:error.message,stack:error.stack});process.exit(1);}
})();
