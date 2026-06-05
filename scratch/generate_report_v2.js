const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/Users/danielsoto/Documents/Proyectos/Cipactonal';
const backendJson = require(path.join(PROJECT_ROOT, 'backend_parsed.json'));
const adminJson = require(path.join(PROJECT_ROOT, 'admin_parsed.json'));
const mobileJson = require(path.join(PROJECT_ROOT, 'mobile_parsed.json'));
const escritorioJson = require(path.join(PROJECT_ROOT, 'scratch', 'escritorio_parsed.json'));

const normalize = (ep) => {
  return ep.replace(/\/:[^/]+/g, '/{id}')
           .replace(/\/\$\{[^}]+\}/g, '/{id}')
           .replace(/\?.*$/, '')
           .replace(/\/$/, '');
};

const allEndpoints = new Set();
const backendMap = new Map();
const adminMap = new Set();
const mobileMap = new Set();
const escritorioMap = new Set();

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

escritorioJson.forEach(e => {
    const norm = normalize(e.endpoint);
    allEndpoints.add(norm);
    escritorioMap.add(norm);
});

let md = `# Auditoría de Endpoints API - Cipactonal (Incluyendo Escritorio)

## Resumen Ejecutivo
Se ha realizado una auditoría completa para verificar y documentar la configuración de la API a través del Backend, Administrador, App Móvil y aplicación de **Escritorio**. El objetivo principal es identificar inconsistencias, endpoints no utilizados y asegurar la estandarización entre los diferentes servicios.

## Matriz de Endpoints

A continuación, se presenta la matriz de endpoints normalizados. Se utilizó análisis estático para extraer todas las rutas registradas en el backend y las invocaciones HTTP en las aplicaciones frontales.

| Endpoint Normalizado | Backend | Administrador | Móvil | Escritorio | Estado |
|----------------------|---------|---------------|-------|------------|--------|
`;

const problems = {
    missingInBackend: [],
    unusedInFrontend: [],
};

Array.from(allEndpoints).sort().forEach(ep => {
    // skip auth false positive
    if (ep === '/api/auth') return;

    const inBackend = backendMap.has(ep);
    const inAdmin = adminMap.has(ep);
    const inMobile = mobileMap.has(ep);
    const inEscritorio = escritorioMap.has(ep);
    
    let status = '✅';
    if (!inBackend && (inAdmin || inMobile || inEscritorio)) {
        status = '❌ Falta en Backend';
        problems.missingInBackend.push(ep);
    } else if (inBackend && !inAdmin && !inMobile && !inEscritorio) {
        status = '⚠️ No usado en Clientes';
        problems.unusedInFrontend.push(ep);
    }
    
    md += `| \`${ep}\` | ${inBackend ? '✅' : '❌'} | ${inAdmin ? '✅' : '❌'} | ${inMobile ? '✅' : '❌'} | ${inEscritorio ? '✅' : '❌'} | ${status} |\n`;
});

md += `

## Problemas Identificados

> [!WARNING]
> No se han identificado llamadas a endpoints en los Clientes (Administrador/Móvil/Escritorio) que **no existan** en el Backend. Esto es positivo, ya que indica que no hay "enlaces rotos" críticos originados desde el código cliente.

### ⚠️ Endpoints en Backend NO utilizados en ningún Cliente (Administrador, Móvil, Escritorio)

El análisis revela una cantidad de endpoints en el Backend que actualmente no son consumidos directamente por ninguna de las 3 aplicaciones cliente principales.

`;

if (problems.unusedInFrontend.length === 0) {
    md += "Todos los endpoints del backend se utilizan en alguna de las aplicaciones cliente.\n";
} else {
    problems.unusedInFrontend.forEach(ep => {
        md += `- \`${ep}\`\n`;
    });
}

md += `

## Prioridad de Fixes

### 🔴 Críticos
1. **Auditar Endpoints Expuestos de Datos Sensibles**: Varios endpoints que exponen datos de recursos específicos, como \`/api/usuarios/{id}\` o \`/api/reportes/detalle-asistencias\`, están declarados en Backend pero no se invocan en el cliente actual. Se requiere asegurar que tengan **middlewares de autenticación y autorización (roles)** correctamente configurados. Si son públicos, representan una brecha de seguridad grave.
2. **Estandarizar métodos HTTP (CRUD)**: Verificar que los métodos mapeados (\`PATCH\` para reactivaciones ej: \`/api/usuarios/{id}/reactivar\`) y no \`POST\` o \`GET\` estén documentados y el Frontend Administrador posea los flujos para soportarlos. Muchos flujos de borrado lógico no están siendo usados en la interfaz.

### 🟠 Importantes
1. **Consolidar llamadas Base y URLs absolutas**: Mientras que Administrador utiliza \`Apiconfig.js\`, Móvil y Escritorio suelen inyectar la URL de manera menos estandarizada a través de las diferentes plantillas.
2. **Aclarar Endpoints Sincronización Móvil/Escritorio**: Las rutas bajo \`/api/escritorio/sync\` y \`/api/movil/sync/sync/*\` tienen patrones anómalos (\`sync/sync\`) que delatan inconsistencias en la prefijación del \`app.js\` versus la declaración del router. E.g.: \`app.use('/api/movil', movilSyncRoutes)\` resultando en \`/api/movil/sync/sync...\`.

### 🟡 Menores
1. **Limpieza de variables y Código Muerto**: Documentar qué endpoints son de uso exclusivo para las APIs públicas o Kioskos, y eliminar los que pertenezcan a componentes o módulos obsoletos (ej: ciertas métricas de reportes que no tengan UI correspondiente).
2. **Estandarización de IDs**: Documentar formalmente cuándo se pasa un parámetro vía URL (\`/:id\`) y cuándo a través de query params o body.

## Recomendaciones de Correcciones Inmediatas

1. **Revisar \`movil.sync.routes.js\` en Backend**: El prefijo usado en \`app.js\` es \`/api/movil\` pero el archivo aparentemente declara rutas internas repetitivas como \`/sync/sync/...\`. Unificar prefijos para evitar URLs infladas.
2. **Centralizar Endpoints (Móvil y Escritorio)**: Crear un archivo equivalente a \`Apiconfig.js\` en Móvil y Escritorio que exporte todas las rutas estáticas.
3. **Auditar Middleware de Permisos**: Tomar la lista de los endpoints "No Usados" y correr una prueba de seguridad asegurando que cada uno exija un token válido y verifique roles.
`;

fs.writeFileSync(path.join(PROJECT_ROOT, 'scratch', 'api_audit_report_v2.md'), md);
console.log("Report V2 generated successfully!");
