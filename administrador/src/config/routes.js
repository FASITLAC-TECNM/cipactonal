import { lazy } from 'react';

// Lazy loading de todas las páginas
const Dashboard = lazy(() => import('../pages/Tablero'));
const Empleados = lazy(() => import('../pages/Empleados'));
const Horarios = lazy(() => import('../pages/Horarios'));
const Departamentos = lazy(() => import('../pages/Departamentos'));
const Roles = lazy(() => import('../pages/Roles'));
const Dispositivos = lazy(() => import('../pages/Dispositivos'));
const Incidencias = lazy(() => import('../pages/Incidencias'));
const Reportes = lazy(() => import('../pages/Reportes'));
const Registros = lazy(() => import('../pages/Registros'));
const Configuracion = lazy(() => import('../pages/Configuracion'));
const PerfilUsuario = lazy(() => import('../pages/PerfilUsuario'));
const Avisos = lazy(() => import('../pages/Avisos'));
const AdminSaaS = lazy(() => import('../pages/AdminSaaS')); // Rutas SuperUser
const EmpresasSaaS = lazy(() => import('../pages/EmpresasSaaS'));
const ConfigurarEmpresaSaaS = lazy(() => import('../pages/ConfigurarEmpresaSaaS'));
const SaasLogs = lazy(() => import('../pages/SaasLogs'));

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