const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/Users/danielsoto/Documents/Proyectos/Cipactonal';

function findFiles(dir, filter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.') && file !== 'build' && file !== 'dist') {
        findFiles(filePath, filter, fileList);
      }
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const escritorioFiles = findFiles(path.join(PROJECT_ROOT, 'escritorio'), /\.(js|jsx|ts|tsx)$/);

const extractEndpoints = (files) => {
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
    
    // Match template literals with variables
    const matchesTemplate = content.match(/`\/api\/[^`$]*\$\{[^}]+\}[^`]*`/g);
    if (matchesTemplate) {
      matchesTemplate.forEach(m => {
        results.push({ file: file.replace(PROJECT_ROOT, ''), endpoint: m.replace(/`/g, ''), type: 'template' });
      });
    }
  });
  return results;
};

const escritorioEndpoints = extractEndpoints(escritorioFiles);

fs.writeFileSync(path.join(PROJECT_ROOT, 'scratch', 'escritorio_parsed.json'), JSON.stringify(escritorioEndpoints, null, 2));

console.log("Escritorio endpoints found:", escritorioEndpoints.length);
