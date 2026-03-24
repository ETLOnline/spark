const fs = require('fs');
const path = require('path');

const projectRoot = '/Users/leetworm/projects/etl/Project Spark/spark/src/app/api';

function findRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findRouteFiles(filePath));
    } else {
      if (file === 'route.ts') {
        results.push(filePath);
      }
    }
  }
  return results;
}

const files = findRouteFiles(projectRoot);
let filesChanged = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const regex = /export\s+async\s+function\s+([A-Z]+)\s*\(\s*([^,]+)\s*,\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*(.+?)\s*\}\s*\)\s*\{/g;
  
  content = content.replace(regex, (match, method, reqArg, paramsType) => {
    // If it is already a Promise, skip
    if (paramsType.includes('Promise')) {
      return match;
    }
    changed = true;
    return `export async function ${method}(${reqArg}, { params }: { params: Promise<${paramsType.trim()}> }) {\n  const resolvedParams = await params;`;
  });

  if (changed) {
    // Replace params. with resolvedParams.
    content = content.replace(/\bparams\./g, 'resolvedParams.');
    
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
    filesChanged++;
  }
}

console.log('Total files fixed:', filesChanged);
