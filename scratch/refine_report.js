const fs = require('fs');
const path = require('path');

const reportPath = '/Users/danielsoto/Documents/Proyectos/Cipactonal/scratch/api_audit_report.md';
let content = fs.readFileSync(reportPath, 'utf8');

// Fix the false positive for /api/auth
content = content.replace(/\| \/api\/auth \| ❌ \| ✅ \| ❌ \| ❌ Falta en Backend \|\n/g, '');
content = content.replace(/- `\/api\/auth`\n/g, '');

// Add Priorities
const prioritiesSection = `
## Prioridad de Fixes

### 🔴 Críticos
- **Consolidar llamadas Base**: Muchos servicios en el Frontend (Mobile/Administrador) construyen URLs base en lugar de importar una configuración centralizada consistentemente.
- **Auditar Endpoints Expuestos**: Muchos endpoints en Backend que exponen datos sensibles (como `/api/usuarios/{id}`, `/api/asistencias/empleado/{id}`) están declarados en Backend pero no se detectaron en Frontend. Si son públicos, representan una falla de seguridad potencial.

### 🟠 Importantes
- **Estandarizar nombres y parámetros**: Algunos endpoints como \`/api/escritorio/sync\` usan subrutas que rompen el patrón REST (ej: \`/api/escritorio/sync/sync/asistencias\`).
- **Limpieza de Código Muerto**: Hay más de 100 endpoints en el Backend que no parecen estar consumiéndose. Se debe revisar si estos endpoints son consumidos por otras aplicaciones (Kioscos, servicios externos) o si son código muerto.

### 🟡 Menores
- **Estandarización de IDs**: Documentar cómo se pasan los parámetros en la ruta vs query params.
- **Configuraciones de Base de Datos**: Mapear endpoints de mantenimientos y configuraciones globales para tener una herramienta de administrador más robusta.

`;

content = content.replace('## Recomendaciones', prioritiesSection + '## Recomendaciones');

fs.writeFileSync('/Users/danielsoto/Documents/Proyectos/Cipactonal/scratch/api_audit_report_final.md', content);
