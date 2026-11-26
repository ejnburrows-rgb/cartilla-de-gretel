process.send({type:'ready', node:process.version});
process.on('message', message => {
  process.send({type:'echo', nonce:message.nonce}, () => process.disconnect());
});
