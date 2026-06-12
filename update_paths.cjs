const fs = require('fs');

const files = [
  'src/data/workbook-interactions.json',
  'src/data/source-art-inventory.json',
  'src/data/teacher-flipchart.json'
];

function processPath(str) {
  const m = str.match(/page-0*(\d+)\.(jpg|png|webp)/i);
  if (m) {
    const num = m[1];
    const isAbsolute = str.startsWith('/');
    return (isAbsolute ? '/' : '') + `art/hd/page-${num}.png`;
  }
  return str;
}

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  const obj = JSON.parse(content);
  
  function traverse(node, key) {
    if (typeof node === 'string') {
      if ((key === 'assetRef' || key === 'path' || key === 'assetPath') && node.includes('page-')) {
        const newVal = processPath(node);
        if (newVal !== node) {
          changed = true;
          return newVal;
        }
      }
    } else if (Array.isArray(node)) {
      for (let i=0; i<node.length; i++) {
        node[i] = traverse(node[i], key);
      }
    } else if (node && typeof node === 'object') {
      for (let k in node) {
        node[k] = traverse(node[k], k);
      }
    }
    return node;
  }
  
  const newObj = traverse(obj, null);
  if (changed) {
    fs.writeFileSync(file, JSON.stringify(newObj, null, 2));
    console.log(`Updated ${file}`);
  }
});
