import { lazy } from 'react';

// Wrapper para manejar errores de carga de chunks (Vite/React) tras nuevos despliegues en producción
const lazyWithRetry = (componentImport) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
        );

        try {
            const component = await componentImport();
            window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
            return component;
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                // Si falla al cargar el chunk, forzar recarga para obtener el nuevo index.html con los nuevos hashes
                window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
                window.location.reload();
                // Devolver una promesa que nunca se resuelve para evitar renderizado antes del recargo
                return new Promise(() => {});
            }
            throw error;
        }
    });

// Lazy loading de todas las páginas con reintento automático
const Dashboard = lazyWithRetry(() => import('../pages/Tablero'));
const Empleados = lazyWithRetry(() => import('../pages/Empleados'));
const Horarios = lazyWithRetry(() => import('../pages/Horarios'));
const Departamentos = lazyWithRetry(() => import('../pages/Departamentos'));
const Roles = lazyWithRetry(() => import('../pages/Roles'));
const Dispositivos = lazyWithRetry(() => import('../pages/Dispositivos'));
const Incidencias = lazyWithRetry(() => import('../pages/Incidencias'));
const Reportes = lazyWithRetry(() => import('../pages/Reportes'));
const Registros = lazyWithRetry(() => import('../pages/Registros'));
const Configuracion = lazyWithRetry(() => import('../pages/Configuracion'));
const PerfilUsuario = lazyWithRetry(() => import('../pages/PerfilUsuario'));
const Avisos = lazyWithRetry(() => import('../pages/Avisos'));
const AdminSaaS = lazyWithRetry(() => import('../pages/AdminSaaS')); // Rutas SuperUser
const EmpresasSaaS = lazyWithRetry(() => import('../pages/EmpresasSaaS'));
const ConfigurarEmpresaSaaS = lazyWithRetry(() => import('../pages/ConfigurarEmpresaSaaS'));
const SaasLogs = lazyWithRetry(() => import('../pages/SaasLogs'));

export const protectedRoutes = [
    { path: '/dashboard', component: Dashboard },
    { path: '/avisos', component: Avisos, permission: 'AVISO_VER' },
    { path: '/empleados', component: Empleados, permission: 'USUARIO_VER' },
    { path: '/horarios', component: Horarios, permission: 'HORARIO_VER' },
    { path: '/departamentos', component: Departamentos, permission: 'DEPARTAMENTO_VER' },
    { path: '/roles', component: Roles, permission: 'ROL_VER' },
    { path: '/dispositivos', component: Dispositivos, permission: 'DISPOSITIVO_VER' },
    { path: '/incidencias', component: Incidencias, permission: 'HORARIO_VER' },
    { path: '/reportes', component: Reportes, permission: 'REPORTE_VER' },
    { path: '/registros', component: Registros, permission: 'REGISTRO_VER' },
    { path: '/configuracion', component: Configuracion, permission: 'CONFIG_VER' },
    { path: '/super-administradores', component: AdminSaaS, requireAdmin: true },
    { path: '/empresas', component: EmpresasSaaS, requireAdmin: true },
    { path: '/empresas/:id', component: ConfigurarEmpresaSaaS, requireAdmin: true },
    { path: '/saas-logs', component: SaasLogs, requireAdmin: true },
];

export const specialRoutes = [
    { path: 'empleados/usuario/:username', component: PerfilUsuario },
];