# Auditoría de Endpoints API - Cipactonal

## Matriz de Endpoints

| Endpoint Normalizado | Backend (Existe?) | Administrador (Usa?) | Móvil (Usa?) | Estado |
|----------------------|-------------------|----------------------|--------------|--------|
| /api/asistencias | ✅ | ✅ | ❌ | ✅ |
| /api/asistencias/empleado/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/asistencias/empleado/{id}/equivalencias | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/asistencias/estado/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/asistencias/hoy | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/asistencias/manual | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/asistencias/movil/estado-boton/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/asistencias/registrar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth | ❌ | ✅ | ❌ | ❌ Falta en Backend |
| /api/auth/biometric | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/cambiar-password | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/impersonate | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/login | ✅ | ✅ | ❌ | ✅ |
| /api/auth/login-saas | ✅ | ✅ | ❌ | ✅ |
| /api/auth/logout | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/recuperar-password | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/reset-password | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/token-escritorio | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/token-kiosco | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/token-movil | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/auth/verificar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/avisos | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/avisos/globales | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/avisos/publicos | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/avisos/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/biometrico | ✅ | ✅ | ❌ | ✅ |
| /api/biometrico/escritorio/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/biometrico/stats | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/biometrico/sync-status | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/biometrico/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/biometrico/{id}/estado | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/configuracion | ✅ | ✅ | ❌ | ✅ |
| /api/configuracion/public/status | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/configuracion/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/configuracion/{id}/mantenimiento | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/configuracionesEscritorio/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/credenciales | ✅ | ✅ | ❌ | ✅ |
| /api/credenciales/dactilar | ✅ | ❌ | ✅ | ✅ |
| /api/credenciales/empleado/{id} | ✅ | ❌ | ✅ | ✅ |
| /api/credenciales/facial | ✅ | ❌ | ✅ | ✅ |
| /api/credenciales/facial/identify | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/credenciales/facial/verify-image | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/credenciales/pin | ✅ | ❌ | ✅ | ✅ |
| /api/credenciales/pin/login | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/credenciales/publico/dactilar/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/credenciales/publico/lista | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/credenciales/verificar-pin | ✅ | ❌ | ✅ | ✅ |
| /api/departamentos | ✅ | ✅ | ❌ | ✅ |
| /api/departamentos/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/departamentos/{id}/reactivar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/diasFestivos | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/diasFestivos/sincronizar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/diasFestivos/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empleados | ✅ | ✅ | ❌ | ✅ |
| /api/empleados/buscar/nss/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empleados/buscar/rfc/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empleados/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empleados/{id}/avisos | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empleados/{id}/departamentos | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empleados/{id}/departamentos/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empleados/{id}/horario | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empresas | ✅ | ✅ | ✅ | ✅ |
| /api/empresas/identificador/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/empresas/mi-empresa | ✅ | ❌ | ✅ | ✅ |
| /api/empresas/public/{id} | ✅ | ❌ | ✅ | ✅ |
| /api/empresas/{id} | ✅ | ❌ | ✅ | ✅ |
| /api/escritorio | ✅ | ✅ | ❌ | ✅ |
| /api/escritorio/status/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/escritorio/sync/asistencias-pendientes | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/escritorio/sync/datos-referencia | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/escritorio/sync/raw-punch | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/escritorio/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/escritorio/{id}/comando | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/escritorio/{id}/comando-kiosko | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/escritorio/{id}/comando-watchdog | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/escritorio/{id}/reactivar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/eventos | ✅ | ✅ | ❌ | ✅ |
| /api/eventos/recientes | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/eventos/stats | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/eventos/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/horarios | ✅ | ✅ | ❌ | ✅ |
| /api/horarios/sistema/importar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/horarios/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/horarios/{id}/asignar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/horarios/{id}/reactivar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/incidencias | ✅ | ✅ | ❌ | ✅ |
| /api/incidencias/pendientes | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/incidencias/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/incidencias/{id}/aprobar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/incidencias/{id}/rechazar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/modulos | ✅ | ✅ | ❌ | ✅ |
| /api/modulos/menu | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/modulos/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/movil | ✅ | ✅ | ❌ | ✅ |
| /api/movil/empleado/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/movil/sync/sync/asistencias | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/movil/sync/sync/dispositivos/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/movil/sync/sync/mis-datos | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/movil/sync/sync/sesiones | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/movil/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/movil/{id}/reactivar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/checadas/quincena | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/comparativa-departamentos | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/desempeno | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/detalle-asistencias | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/detalle-incidencias | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/estadisticas-departamento/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/estadisticas-empleado/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/estadisticas-globales | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/reportes/incidencias/rrhh | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/roles | ✅ | ✅ | ❌ | ✅ |
| /api/roles/permisos/catalogo | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/roles/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/roles/{id}/reactivar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/roles/{id}/usuarios | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/saas/logs | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/saas/metricas | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/solicitudes | ✅ | ✅ | ❌ | ✅ |
| /api/solicitudes/pendientes | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/solicitudes/stream | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/solicitudes/validar-afiliacion | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/solicitudes/verificar/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/solicitudes/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/solicitudes/{id}/aceptar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/solicitudes/{id}/pendiente | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/solicitudes/{id}/rechazar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/stream | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/superadmin | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/tolerancias | ✅ | ✅ | ❌ | ✅ |
| /api/tolerancias/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/usuarios | ✅ | ✅ | ❌ | ✅ |
| /api/usuarios/username/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/usuarios/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/usuarios/{id}/reactivar | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/usuarios/{id}/roles | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |
| /api/usuarios/{id}/roles/{id} | ✅ | ❌ | ❌ | ⚠️ No usado en Frontend |


## Problemas Identificados

### ❌ Endpoints usados en Frontend pero que NO existen en Backend
- `/api/auth`

### ⚠️ Endpoints en Backend NO utilizados en Administrador ni Móvil
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
- `/api/avisos`
- `/api/avisos/globales`
- `/api/avisos/publicos`
- `/api/avisos/{id}`
- `/api/biometrico/escritorio/{id}`
- `/api/biometrico/stats`
- `/api/biometrico/sync-status`
- `/api/biometrico/{id}`
- `/api/biometrico/{id}/estado`
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

## Recomendaciones

1. **Estandarización de Rutas**: Asegurar que las llamadas en Frontend utilicen la misma estructura y nomenclatura que las rutas del Backend.
2. **Revisión de Endpoints No Usados**: Evaluar si los endpoints que no se están consumiendo en el Frontend son para uso interno, a futuro, o si pueden ser eliminados para limpiar el código.
3. **Manejo de IDs**: Estandarizar si las rutas usan parámetros `/:id` o en el body de la petición, documentándolo formalmente.
4. **Limpieza de variables**: Algunos endpoints como `/api/escritorio/sync` o `/api/configuraciones-escritorio` parecen ser muy específicos y podrían no estar documentados en `Apiconfig.js`. Se recomienda añadirlos si se van a consumir desde React.
