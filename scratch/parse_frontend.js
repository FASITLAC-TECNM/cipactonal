const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = '/Users/danielsoto/Documents/Proyectos/Cipactonal';

function findFiles(dir, filter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        findFiles(filePath, filter, fileList);
      }
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const adminFiles = findFiles(path.join(PROJECT_ROOT, 'administrador', 'src'), /\.(js|jsx)$/);
const mobileFiles = findFiles(path.join(PROJECT_ROOT, 'Mobile'), /\.(js|jsx)$/);

const extractEndpoints = (files, sourceName) => {
  const results = [];
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match literal strings starting with /api/
    const matchesLiteral = content.match(/['"`]\/api\/[^'"`]*['"`]/g);
    if (matchesLiteral) {
      matchesLiteral.forEach(m => {
        results.push({ file: file.replace(PROJECT_ROOT, ''), endpoint: m.replace(/['"`]/g, ''), type: 'literal' });
      });
    }
    
    // Match template literals with variables (best effort)
    const matchesTemplate = content.match(/`\/api\/[^`$]*\$\{[^}]+\}[^`]*`/g);
    if (matchesTemplate) {
      matchesTemplate.forEach(m => {
        results.push({ file: file.replace(PROJECT_ROOT, ''), endpoint: m.replace(/`/g, ''), type: 'template' });
      });
    }
  });
  return results;
};

const adminEndpoints = extractEndpoints(adminFiles, 'admin');
const mobileEndpoints = extractEndpoints(mobileFiles, 'mobile');

fs.writeFileSync(path.join(PROJECT_ROOT, 'admin_parsed.json'), JSON.stringify(adminEndpoints, null, 2));
fs.writeFileSync(path.join(PROJECT_ROOT, 'mobile_parsed.json'), JSON.stringify(mobileEndpoints, null, 2));

console.log("Admin endpoints found:", adminEndpoints.length);
console.log("Mobile endpoints found:", mobileEndpoints.length);
