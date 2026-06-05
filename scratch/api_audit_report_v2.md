# Auditoría de Endpoints API - Cipactonal (Incluyendo Escritorio)

## Resumen Ejecutivo
Se ha realizado una auditoría completa para verificar y documentar la configuración de la API a través del Backend, Administrador, App Móvil y aplicación de **Escritorio**. El objetivo principal es identificar inconsistencias, endpoints no utilizados y asegurar la estandarización entre los diferentes servicios.

## Matriz de Endpoints

A continuación, se presenta la matriz de endpoints normalizados. Se utilizó análisis estático para extraer todas las rutas registradas en el backend y las invocaciones HTTP en las aplicaciones frontales.

| Endpoint Normalizado | Backend | Administrador | Móvil | Escritorio | Estado |
|----------------------|---------|---------------|-------|------------|--------|
| `/api/asistencias` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/asistencias/empleado/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/asistencias/empleado/{id}/equivalencias` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/asistencias/estado/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/asistencias/hoy` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/asistencias/manual` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/asistencias/movil/estado-boton/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/asistencias/registrar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/biometric` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/cambiar-password` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/impersonate` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/login` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/api/auth/login-saas` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/api/auth/logout` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/recuperar-password` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/reset-password` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/token-escritorio` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/token-kiosco` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/token-movil` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/auth/verificar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/avisos` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `/api/avisos/globales` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/avisos/publicos` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/avisos/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/biometrico` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/biometrico/escritorio/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/biometrico/stats` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/biometrico/sync-status` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/biometrico/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/biometrico/{id}/estado` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `/api/configuracion` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/configuracion/public/status` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/configuracion/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/configuracion/{id}/mantenimiento` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/configuraciones-escritorio` | ❌ | ❌ | ❌ | ✅ | ❌ Falta en Backend |
| `/api/configuracionesEscritorio/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/credenciales` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/credenciales/dactilar` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `/api/credenciales/empleado/{id}` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `/api/credenciales/facial` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `/api/credenciales/facial/identify` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/credenciales/facial/verify-image` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/credenciales/pin` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `/api/credenciales/pin/login` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/credenciales/publico/dactilar/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/credenciales/publico/lista` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/credenciales/verificar-pin` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `/api/departamentos` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/departamentos/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/departamentos/{id}/reactivar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/diasFestivos` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/diasFestivos/sincronizar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/diasFestivos/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empleados` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/empleados/buscar/nss/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empleados/buscar/rfc/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empleados/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empleados/{id}/avisos` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empleados/{id}/departamentos` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empleados/{id}/departamentos/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empleados/{id}/horario` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empresas` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/empresas/identificador/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/empresas/mi-empresa` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `/api/empresas/public/{id}` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `/api/empresas/{id}` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `/api/escritorio` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/escritorio/status/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/escritorio/sync/asistencias-pendientes` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/escritorio/sync/datos-referencia` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/escritorio/sync/raw-punch` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/escritorio/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/escritorio/{id}/comando` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/escritorio/{id}/comando-kiosko` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/escritorio/{id}/comando-watchdog` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/escritorio/{id}/reactivar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/eventos` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/eventos/recientes` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/eventos/stats` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/eventos/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/horarios` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/horarios/sistema/importar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/horarios/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/horarios/{id}/asignar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/horarios/{id}/reactivar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/incidencias` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/incidencias/pendientes` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/incidencias/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/incidencias/{id}/aprobar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/incidencias/{id}/rechazar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/modulos` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/modulos/menu` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/modulos/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/movil` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/movil/empleado/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/movil/sync/sync/asistencias` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/movil/sync/sync/dispositivos/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/movil/sync/sync/mis-datos` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/movil/sync/sync/sesiones` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/movil/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/movil/{id}/reactivar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/checadas/quincena` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/comparativa-departamentos` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/desempeno` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/detalle-asistencias` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/detalle-incidencias` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/estadisticas-departamento/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/estadisticas-empleado/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/estadisticas-globales` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/reportes/incidencias/rrhh` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/roles` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/roles/permisos/catalogo` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/roles/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/roles/{id}/reactivar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/roles/{id}/usuarios` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/saas/logs` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/saas/metricas` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/solicitudes` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/solicitudes/pendientes` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/solicitudes/stream` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/solicitudes/validar-afiliacion` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/solicitudes/verificar/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/solicitudes/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/solicitudes/{id}/aceptar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/solicitudes/{id}/pendiente` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/solicitudes/{id}/rechazar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/stream` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/superadmin` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/tolerancias` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/tolerancias/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/usuarios` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `/api/usuarios/username/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/usuarios/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/usuarios/{id}/reactivar` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/usuarios/{id}/roles` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |
| `/api/usuarios/{id}/roles/{id}` | ✅ | ❌ | ❌ | ❌ | ⚠️ No usado en Clientes |


## Problemas Identificados

> [!WARNING]
> No se han identificado llamadas a endpoints en los Clientes (Administrador/Móvil/Escritorio) que **no existan** en el Backend. Esto es positivo, ya que indica que no hay "enlaces rotos" críticos originados desde el código cliente.

### ⚠️ Endpoints en Backend NO utilizados en ningún Cliente (Administrador, Móvil, Escritorio)

El análisis revela una cantidad de endpoints en el Backend que actualmente no son consumidos directamente por ninguna de las 3 aplicaciones cliente principales.

- `/api/asistencias/empleado/{id}`
- `/api/asistencias/empleado/{id}/equivalencias`
- `/api/asistencias/estado/{id}`
- `/api/asistencias/hoy`
- `/api/asistencias/manual`
- `/api/asistencias/movil/estado-boton/{id}`
- `/api/asistencias/registrar`
- `/api/auth/biometric`
- `/api/auth/cambiar-password`
- `/api/auth/impersonate`
- `/api/auth/logout`
- `/api/auth/recuperar-password`
- `/api/auth/reset-password`
- `/api/auth/token-escritorio`
- `/api/auth/token-kiosco`
- `/api/auth/token-movil`
- `/api/auth/verificar`
- `/api/avisos/globales`
- `/api/avisos/publicos`
- `/api/avisos/{id}`
- `/api/biometrico/escritorio/{id}`
- `/api/biometrico/stats`
- `/api/biometrico/sync-status`
- `/api/biometrico/{id}`
- `/api/configuracion/public/status`
- `/api/configuracion/{id}`
- `/api/configuracion/{id}/mantenimiento`
- `/api/configuracionesEscritorio/{id}`
- `/api/credenciales/facial/identify`
- `/api/credenciales/facial/verify-image`
- `/api/credenciales/pin/login`
- `/api/credenciales/publico/dactilar/{id}`
- `/api/credenciales/publico/lista`
- `/api/departamentos/{id}`
- `/api/departamentos/{id}/reactivar`
- `/api/diasFestivos`
- `/api/diasFestivos/sincronizar`
- `/api/diasFestivos/{id}`
- `/api/empleados/buscar/nss/{id}`
- `/api/empleados/buscar/rfc/{id}`
- `/api/empleados/{id}`
- `/api/empleados/{id}/avisos`
- `/api/empleados/{id}/departamentos`
- `/api/empleados/{id}/departamentos/{id}`
- `/api/empleados/{id}/horario`
- `/api/empresas/identificador/{id}`
- `/api/escritorio/status/{id}`
- `/api/escritorio/sync/asistencias-pendientes`
- `/api/escritorio/sync/datos-referencia`
- `/api/escritorio/sync/raw-punch`
- `/api/escritorio/{id}`
- `/api/escritorio/{id}/comando`
- `/api/escritorio/{id}/comando-kiosko`
- `/api/escritorio/{id}/comando-watchdog`
- `/api/escritorio/{id}/reactivar`
- `/api/eventos/recientes`
- `/api/eventos/stats`
- `/api/eventos/{id}`
- `/api/horarios/sistema/importar`
- `/api/horarios/{id}`
- `/api/horarios/{id}/asignar`
- `/api/horarios/{id}/reactivar`
- `/api/incidencias/pendientes`
- `/api/incidencias/{id}`
- `/api/incidencias/{id}/aprobar`
- `/api/incidencias/{id}/rechazar`
- `/api/modulos/menu`
- `/api/modulos/{id}`
- `/api/movil/empleado/{id}`
- `/api/movil/sync/sync/asistencias`
- `/api/movil/sync/sync/dispositivos/{id}`
- `/api/movil/sync/sync/mis-datos`
- `/api/movil/sync/sync/sesiones`
- `/api/movil/{id}`
- `/api/movil/{id}/reactivar`
- `/api/reportes/checadas/quincena`
- `/api/reportes/comparativa-departamentos`
- `/api/reportes/desempeno`
- `/api/reportes/detalle-asistencias`
- `/api/reportes/detalle-incidencias`
- `/api/reportes/estadisticas-departamento/{id}`
- `/api/reportes/estadisticas-empleado/{id}`
- `/api/reportes/estadisticas-globales`
- `/api/reportes/incidencias/rrhh`
- `/api/roles/permisos/catalogo`
- `/api/roles/{id}`
- `/api/roles/{id}/reactivar`
- `/api/roles/{id}/usuarios`
- `/api/saas/logs`
- `/api/saas/metricas`
- `/api/solicitudes/pendientes`
- `/api/solicitudes/stream`
- `/api/solicitudes/validar-afiliacion`
- `/api/solicitudes/verificar/{id}`
- `/api/solicitudes/{id}`
- `/api/solicitudes/{id}/aceptar`
- `/api/solicitudes/{id}/pendiente`
- `/api/solicitudes/{id}/rechazar`
- `/api/stream`
- `/api/superadmin`
- `/api/tolerancias/{id}`
- `/api/usuarios/username/{id}`
- `/api/usuarios/{id}`
- `/api/usuarios/{id}/reactivar`
- `/api/usuarios/{id}/roles`
- `/api/usuarios/{id}/roles/{id}`


## Prioridad de Fixes

### 🔴 Críticos
1. **Auditar Endpoints Expuestos de Datos Sensibles**: Varios endpoints que exponen datos de recursos específicos, como `/api/usuarios/{id}` o `/api/reportes/detalle-asistencias`, están declarados en Backend pero no se invocan en el cliente actual. Se requiere asegurar que tengan **middlewares de autenticación y autorización (roles)** correctamente configurados. Si son públicos, representan una brecha de seguridad grave.
2. **Estandarizar métodos HTTP (CRUD)**: Verificar que los métodos mapeados (`PATCH` para reactivaciones ej: `/api/usuarios/{id}/reactivar`) y no `POST` o `GET` estén documentados y el Frontend Administrador posea los flujos para soportarlos. Muchos flujos de borrado lógico no están siendo usados en la interfaz.

### 🟠 Importantes
1. **Consolidar llamadas Base y URLs absolutas**: Mientras que Administrador utiliza `Apiconfig.js`, Móvil y Escritorio suelen inyectar la URL de manera menos estandarizada a través de las diferentes plantillas.
2. **Aclarar Endpoints Sincronización Móvil/Escritorio**: Las rutas bajo `/api/escritorio/sync` y `/api/movil/sync/sync/*` tienen patrones anómalos (`sync/sync`) que delatan inconsistencias en la prefijación del `app.js` versus la declaración del router. E.g.: `app.use('/api/movil', movilSyncRoutes)` resultando en `/api/movil/sync/sync...`.

### 🟡 Menores
1. **Limpieza de variables y Código Muerto**: Documentar qué endpoints son de uso exclusivo para las APIs públicas o Kioskos, y eliminar los que pertenezcan a componentes o módulos obsoletos (ej: ciertas métricas de reportes que no tengan UI correspondiente).
2. **Estandarización de IDs**: Documentar formalmente cuándo se pasa un parámetro vía URL (`/:id`) y cuándo a través de query params o body.

## Recomendaciones de Correcciones Inmediatas

1. **Revisar `movil.sync.routes.js` en Backend**: El prefijo usado en `app.js` es `/api/movil` pero el archivo aparentemente declara rutas internas repetitivas como `/sync/sync/...`. Unificar prefijos para evitar URLs infladas.
2. **Centralizar Endpoints (Móvil y Escritorio)**: Crear un archivo equivalente a `Apiconfig.js` en Móvil y Escritorio que exporte todas las rutas estáticas.
3. **Auditar Middleware de Permisos**: Tomar la lista de los endpoints "No Usados" y correr una prueba de seguridad asegurando que cada uno exija un token válido y verifique roles.
