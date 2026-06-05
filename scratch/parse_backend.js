const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = '/Users/danielsoto/Documents/Proyectos/Cipactonal';

// 1. Backend routes
const backendRoutesRaw = fs.readFileSync(path.join(PROJECT_ROOT, 'backend_routes_list.txt'), 'utf8');
const backendAppRoutesRaw = fs.readFileSync(path.join(PROJECT_ROOT, 'backend_app_routes.txt'), 'utf8');

const appPrefixes = {};
backendAppRoutesRaw.split('\n').forEach(line => {
    const match = line.match(/app\.use\(['"](\/api\/[^'"]+)['"],\s*(\w+)/);
    if (match) {
        appPrefixes[match[2]] = match[1];
    }
});
// Hack for movilSyncRoutes which maps to /api/movil
appPrefixes['movilSyncRoutes'] = '/api/movil';
appPrefixes['escritorioSyncRoutes'] = '/api/escritorio/sync';

const backendEndpoints = [];
backendRoutesRaw.split('\n').forEach(line => {
    if (!line.trim()) return;
    const parts = line.split(':');
    const file = parts[0];
    const code = parts.slice(1).join(':');
    
    const routeMatch = code.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/);
    if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        let routePath = routeMatch[2];
        if (routePath === '/') routePath = '';
        
        const fileName = path.basename(file, '.js');
        const routeName = fileName.replace('.routes', 'Routes');
        // Simple mapping
        let prefix = '/api/' + fileName.replace('.routes', '').replace('.sync', '/sync');
        if (fileName === 'configuracionesEscritorio') prefix = '/api/configuraciones-escritorio';
        if (fileName === 'diasFestivos') prefix = '/api/dias-festivos';
        if (fileName === 'superadmin') prefix = '/api/super-administradores';
        
        const fullEndpoint = prefix + routePath;
        backendEndpoints.push({ method, endpoint: fullEndpoint, file: file.replace(PROJECT_ROOT, '') });
    }
});

fs.writeFileSync(path.join(PROJECT_ROOT, 'backend_parsed.json'), JSON.stringify(backendEndpoints, null, 2));

console.log("Backend endpoints parsed:", backendEndpoints.length);
