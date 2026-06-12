import fs from 'fs';
import path from 'path';

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        findFiles(path.join(dir, file), fileList);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

const frontendDir = path.resolve('e:/Healxista/frontend');
const allFiles = findFiles(frontendDir);

const fileMap = new Map();
for (const file of allFiles) {
  fileMap.set(file.toLowerCase(), file);
}

let mismatches = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.') || importPath.startsWith('@/')) {
      let absoluteImportPath;
      if (importPath.startsWith('@/')) {
        absoluteImportPath = path.join(frontendDir, 'src', importPath.slice(2));
      } else {
        absoluteImportPath = path.join(path.dirname(file), importPath);
      }
      
      // Try with common extensions
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
      let found = false;
      let matchedCase = null;
      let actualCase = null;
      
      for (const ext of extensions) {
        const fullPath = absoluteImportPath + ext;
        const lowerFullPath = fullPath.toLowerCase();
        
        if (fileMap.has(lowerFullPath)) {
          found = true;
          actualCase = fileMap.get(lowerFullPath);
          if (fullPath !== actualCase) {
            console.log(`Mismatch in ${file}:`);
            console.log(`  Imported: ${fullPath}`);
            console.log(`  Actual:   ${actualCase}`);
            mismatches++;
          }
          break;
        }
      }
    }
  }
}

if (mismatches === 0) {
  console.log('No case mismatches found.');
}
