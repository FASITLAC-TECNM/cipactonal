const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/Users/danielsoto/Documents/Proyectos/Cipactonal';
const backendJson = require(path.join(PROJECT_ROOT, 'backend_parsed.json'));
const adminJson = require(path.join(PROJECT_ROOT, 'admin_parsed.json'));
const mobileJson = require(path.join(PROJECT_ROOT, 'mobile_parsed.json'));

// Normalize endpoints for comparison (e.g. /api/empresas/:id vs /api/empresas/${id})
const normalize = (ep) => {
  return ep.replace(/\/:[^/]+/g, '/{id}')
           .replace(/\/\$\{[^}]+\}/g, '/{id}')
           .replace(/\?.*$/, '') // remove query params
           .replace(/\/$/, ''); // remove trailing slash
};

const allEndpoints = new Set();
const backendMap = new Map();
const adminMap = new Set();
const mobileMap = new Set();

backendJson.forEach(b => {
    const norm = normalize(b.endpoint);
    allEndpoints.add(norm);
    if(!backendMap.has(norm)) backendMap.set(norm, []);
    backendMap.get(norm).push(b);
});

adminJson.forEach(a => {
    const norm = normalize(a.endpoint);
    allEndpoints.add(norm);
    adminMap.add(norm);
});

mobileJson.forEach(m => {
    const norm = normalize(m.endpoint);
    allEndpoints.add(norm);
    mobileMap.add(norm);
});

let md = `# Auditoría de Endpoints API - Cipactonal

## Matriz de Endpoints

| Endpoint Normalizado | Backend (Existe?) | Administrador (Usa?) | Móvil (Usa?) | Estado |
|----------------------|-------------------|----------------------|--------------|--------|
`;

const problems = {
    missingInBackend: [],
    unusedInFrontend: [],
    inconsistencies: []
};

Array.from(allEndpoints).sort().forEach(ep => {
    const inBackend = backendMap.has(ep);
    const inAdmin = adminMap.has(ep);
    const inMobile = mobileMap.has(ep);
    
    let status = '✅';
    if (!inBackend && (inAdmin || inMobile)) {
        status = '❌ Falta en Backend';
        problems.missingInBackend.push(ep);
    } else if (inBackend && !inAdmin && !inMobile) {
        status = '⚠️ No usado en Frontend';
        problems.unusedInFrontend.push(ep);
    }
    
    md += `| ${ep} | ${inBackend ? '✅' : '❌'} | ${inAdmin ? '✅' : '❌'} | ${inMobile ? '✅' : '❌'} | ${status} |\n`;
});

md += `

## Problemas Identificados

### ❌ Endpoints usados en Frontend pero que NO existen en Backend
`;

if (problems.missingInBackend.length === 0) {
    md += "No se encontraron endpoints faltantes.\n";
} else {
    problems.missingInBackend.forEach(ep => {
        md += `- \`${ep}\`\n`;
    });
}

md += `
### ⚠️ Endpoints en Backend NO utilizados en Administrador ni Móvil
`;

if (problems.unusedInFrontend.length === 0) {
    md += "Todos los endpoints del backend se utilizan.\n";
} else {
    problems.unusedInFrontend.forEach(ep => {
        md += `- \`${ep}\`\n`;
    });
}

md += `
## Recomendaciones

1. **Estandarización de Rutas**: Asegurar que las llamadas en Frontend utilicen la misma estructura y nomenclatura que las rutas del Backend.
2. **Revisión de Endpoints No Usados**: Evaluar si los endpoints que no se están consumiendo en el Frontend son para uso interno, a futuro, o si pueden ser eliminados para limpiar el código.
3. **Manejo de IDs**: Estandarizar si las rutas usan parámetros \`/:id\` o en el body de la petición, documentándolo formalmente.
4. **Limpieza de variables**: Algunos endpoints como \`/api/escritorio/sync\` o \`/api/configuraciones-escritorio\` parecen ser muy específicos y podrían no estar documentados en \`Apiconfig.js\`. Se recomienda añadirlos si se van a consumir desde React.
`;

fs.writeFileSync(path.join(PROJECT_ROOT, 'scratch', 'api_audit_report.md'), md);
console.log("Report generated successfully!");
