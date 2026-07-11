const { execSync } = require('child_process');

function search() {
  const branches = execSync('git branch -r').toString().split('\n').map(b => b.trim()).filter(b => b && !b.includes('->'));
  console.log('Searching ' + branches.length + ' branches for teacher guide...');
  
  const keywords = ['Guía del profesor', 'objetivo', 'motivación', 'Tareas para el hogar', 'Tablas silábicas'];
  
  for (const kw of keywords) {
    console.log(`\n--- Searching for "${kw}" ---`);
    let found = false;
    for (const b of branches) {
      try {
        const result = execSync(`git grep -i "${kw}" ${b} --`).toString();
        if (result) {
          console.log(`Found in branch: ${b}`);
          console.log(result.substring(0, 300) + '...');
          found = true;
          // Don't flood output, just show first match per keyword
          break;
        }
      } catch(e) {
        // git grep returns exit code 1 if no matches found
      }
    }
    if (!found) {
      console.log(`No matches found for "${kw}" in any branch.`);
    }
  }
}

search();
