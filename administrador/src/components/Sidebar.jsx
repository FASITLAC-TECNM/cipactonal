import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Book, Users, Calendar, Settings, BarChart3, AlertCircle, Menu, X, ChevronLeft, Building2, Shield, Cpu, WifiOff, MessageSquare, Globe, Activity, LogOut } from 'lucide-react'
import { useNetwork } from '../context/NetworkContext';
import { useNotifications } from '../context/NotificationContext';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { useViewTransitionNavigate } from '../hooks/useViewTransitionNavigate';
import NotificationBell from './NotificationBell';
import ConfirmBox from './ConfirmBox';

import { API_CONFIG } from '../config/Apiconfig';
const API_URL = API_CONFIG.BASE_URL;

// Estructura base de menú
const BASE_MENU_ITEMS = [
    { id: 'dashboard', nombre: 'Dashboard', icono: Home, ruta: '/dashboard' },
    { id: 'avisos', nombre: 'Avisos', icono: MessageSquare, ruta: '/avisos' },
    { id: 'empleados', nombre: 'Empleados', icono: Users, ruta: '/empleados' },
    { id: 'roles', nombre: 'Roles', icono: Shield, ruta: '/roles' },
    { id: 'horarios', nombre: 'Horarios', icono: Calendar, ruta: '/horarios' },
    { id: 'departamentos', nombre: 'Departamentos', icono: Building2, ruta: '/departamentos' },
    { id: 'dispositivos', nombre: 'Dispositivos', icono: Cpu, ruta: '/dispositivos' },
    { id: 'incidencias', nombre: 'Incidencias', icono: AlertCircle, ruta: '/incidencias' },
    { id: 'reportes', nombre: 'Reportes', icono: BarChart3, ruta: '/reportes' },
    { id: 'registros', nombre: 'Registros', icono: Book, ruta: '/registros' },
];

const getInitials = (nombre) => {
    if (!nombre) return '?';
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
};


/**
 * Sidebar con menú estático y Configuración en el footer
 */
const Sidebar = () => {
    const navigate = useViewTransitionNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { unreadCount } = useNotifications();
    const { empresa, loading: loadingEmpresa } = useCompany();
    const { user, logout, hasPermission } = useAuth();
    const [confirmAction, setConfirmAction] = useState(null);

    const handleLogout = () => {
        setConfirmAction({
            message: '¿Estás seguro de que deseas cerrar sesión?',
            onConfirm: async () => {
                setConfirmAction(null);
                localStorage.removeItem('saas_auth_token');
                await logout();
                navigate('/login');
            }
        });
    };

    // Opciones Exclusivas del Panel SaaS
    const SAAS_MENU_ITEMS = [
        { id: 'dashboard', nombre: 'Dashboard SaaS', icono: Home, ruta: '/dashboard' },
        { id: 'saas-empresas', nombre: 'Empresas Cliente', icono: Globe, ruta: '/empresas' },
        { id: 'saas-master', nombre: 'Super Administradores', icono: Shield, ruta: '/super-administradores' },
        { id: 'saas-logs', nombre: 'System Logs', icono: Activity, ruta: '/saas-logs' },
    ];

    // Determinar items del menú basado en rol y filtrar por permisos (opcional pero recomendado)
    const unfilteredMenuItems = user?.esPropietarioSaaS
        ? SAAS_MENU_ITEMS
        : BASE_MENU_ITEMS;

    // Filtrar items basado en permisos individuales
    const menuItems = unfilteredMenuItems.filter(item => {
        if (user?.esPropietarioSaaS) return true;

        const itemToPermissions = {
            dashboard: null,
            avisos: ['AVISO_VER', 'AVISO_CREAR', 'AVISO_EDITAR', 'AVISO_ELIMINAR'],
            empleados: ['USUARIO_VER', 'USUARIO_CREAR', 'USUARIO_EDITAR', 'USUARIO_ELIMINAR'],
            roles: ['ROL_VER', 'ROL_CREAR', 'ROL_EDITAR', 'ROL_ELIMINAR', 'ROL_ASIGNAR'],
            horarios: ['HORARIO_VER', 'HORARIO_CREAR', 'HORARIO_EDITAR', 'HORARIO_ELIMINAR', 'HORARIO_ASIGNAR', 'HORARIO_GESTIONAR'],
            departamentos: ['DEPARTAMENTO_VER', 'DEPARTAMENTO_CREAR', 'DEPARTAMENTO_EDITAR', 'DEPARTAMENTO_ELIMINAR', 'DEPARTAMENTO_ASIGNAR'],
            dispositivos: ['DISPOSITIVO_VER', 'DISPOSITIVO_CREAR', 'DISPOSITIVO_EDITAR', 'DISPOSITIVO_ELIMINAR', 'DISPOSITIVO_GESTIONAR'],
            incidencias: ['HORARIO_VER', 'HORARIO_CREAR', 'HORARIO_EDITAR', 'HORARIO_ELIMINAR', 'HORARIO_ASIGNAR', 'HORARIO_GESTIONAR'],
            reportes: ['REPORTE_VER', 'REPORTE_EXPORTAR'],
            registros: ['REGISTRO_VER']
        };

        const reqPermissions = itemToPermissions[item.id];
        if (reqPermissions === undefined || reqPermissions === null) return true;
        return reqPermissions.some(permiso => hasPermission(permiso));
    });

    const handleMenuClick = (ruta) => {
        setIsMobileOpen(false);
        navigate(ruta);
    };

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
    const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

    // Renderiza un botón de menú (reutilizable para la lista y el footer)
    const renderMenuButton = (item) => {
        const IconComponent = item.icono;
        const isActive = location.pathname === item.ruta;

        return (
            <button
                key={item.id}
                onClick={() => handleMenuClick(item.ruta)}
                className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-2xl
                    transition-all duration-300 group relative font-medium hover:-translate-y-0.5 active:translate-y-0
                    ${isActive
                        ? 'bg-primary-600/10 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-600/15 dark:border-primary-500/20 shadow-sm'
                        : 'text-slate-500 dark:text-[#a0a09a] hover:bg-slate-100/60 dark:hover:bg-[#2a2a27] hover:text-slate-900 dark:hover:text-[#e8e8e4] hover:shadow-sm'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.nombre : ''}
            >

                <IconComponent
                    className={`w-5 h-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                        }`}
                />

                {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                        <div className={`font-semibold text-[13px] tracking-wide truncate ${isActive ? 'text-blue-800 dark:text-primary-300' : 'text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'
                            }`}>
                            {item.nombre}
                        </div>
                    </div>
                )}

                {/* Badge de notificaciones para Dispositivos */}
                {item.id === 'dispositivos' && unreadCount > 0 && (
                    <div className={`
                        flex items-center justify-center bg-red-500 text-white font-bold rounded-full
                        ${isCollapsed ? 'absolute top-2 right-2 w-2.5 h-2.5 p-0' : 'w-5 h-5 text-xs ml-2'}
                    `}>
                        {!isCollapsed && (unreadCount > 9 ? '+9' : unreadCount)}
                    </div>
                )}

                {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.nombre}
                    </div>
                )}
            </button>
        );
    };

    return (
        <>
            {/* Botón hamburguesa móvil */}
            <button
                onClick={toggleMobile}
                className="select-none lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-2 bg-white dark:bg-[#1e1e1c] rounded-xl shadow-card dark:shadow-card-dark border border-slate-200/60 dark:border-[#2a2a27]">
                {isMobileOpen ? (
                    <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                ) : (
                    <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                )}
            </button>

            {/* Overlay móvil */}
            {isMobileOpen && (
                <div
                    className="select-none lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
                    onClick={toggleMobile}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          select-none fixed lg:sticky top-4 lg:my-4 lg:ml-4 lg:h-[calc(100vh-2rem)] h-screen
          bg-white dark:bg-[#171715] border border-slate-200/60 dark:border-[#2a2a27]
          transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] z-40 lg:z-10 flex flex-col
          lg:rounded-3xl shadow-panel dark:shadow-panel-dark
          ${isCollapsed ? 'w-20' : 'w-[260px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
        `}
            >
                {/* Offline Indicator */}


                {/* Header con logo y nombre de empresa */}
                <div className={`h-[72px] flex items-center border-b border-transparent flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                    {!isCollapsed ? (
                        <>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {empresa?.logo ? (
                                    <img
                                        src={empresa.logo}
                                        alt={empresa.nombre}
                                        className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-slate-100 dark:border-gray-600 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-500">
                                        <span className="text-white font-bold text-sm">
                                            {empresa?.nombre?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <span className="font-bold text-sm text-slate-800 dark:text-white block leading-tight truncate tracking-tight">
                                        {loadingEmpresa ? (
                                            <span className="block h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                        ) : (
                                            empresa?.nombre || user?.usuario?.nombre || 'Mi Empresa'
                                        )}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={toggleCollapsed}
                                className="hidden lg:block p-2 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 flex-shrink-0 hover:-translate-x-0.5"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={toggleCollapsed}
                            className="hidden lg:flex w-12 h-12 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            title={empresa?.nombre || 'Expandir'}
                        >
                            {empresa?.logo ? (
                                <img
                                    src={empresa.logo}
                                    alt={empresa.nombre}
                                    className="w-10 h-10 rounded object-cover border border-gray-100 dark:border-gray-600"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-primary-600 rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {empresa?.nombre?.charAt(0) || '?'}
                                    </span>
                                </div>
                            )}
                        </button>
                    )}
                </div>

                {/* Contenido del Menú (Scrollable) */}
                <div className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'py-2' : 'py-4'}`}>
                    <nav className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
                        {menuItems.map((item) => renderMenuButton(item))}
                    </nav>
                </div>

                {/* Footer del Sidebar (Configuración y Perfil) */}
                <div className={`flex-shrink-0 bg-transparent px-2 py-2 border-t border-slate-100/50 dark:border-[#2a2a27]`}>
                        <OfflineIndicator isCollapsed={isCollapsed} />
                        
                        {/* Area de Perfil y Acciones Rápidas */}
                        <div className={`flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-[#2a2a27] ${isCollapsed ? 'px-0 flex-col gap-2' : 'px-2'}`}>
                            {/* Perfil */}
                            <div className={`flex items-center gap-3 cursor-pointer group hover:bg-slate-100/60 dark:hover:bg-[#2a2a27] rounded-xl transition-all ${isCollapsed ? 'w-full justify-center p-1' : 'flex-1 p-1.5 min-w-0'}`} onClick={() => navigate(`/empleados/usuario/${user?.usuario?.usuario}`, { state: { preloadedUser: user?.usuario } })}>
                                <div className="w-8 h-8 flex-shrink-0 bg-slate-100 dark:bg-[#2a2a27] rounded-full flex items-center justify-center text-slate-700 dark:text-[#e8e8e4] font-bold text-xs shadow-inner overflow-hidden border border-slate-200 dark:border-[#363632] group-hover:ring-2 group-hover:ring-primary-100 dark:group-hover:ring-[#3a3a36] transition-all">
                                    {user?.usuario?.foto ? (
                                        <img src={user.usuario.foto} alt={user.usuario.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{getInitials(user?.usuario?.nombre)}</span>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-slate-800 dark:text-[#e0e0db] truncate">
                                            {user?.usuario?.nombre}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Notifications & Logout */}
                            <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2 w-full' : 'gap-1'}`}>
                                <div className="flex items-center justify-center -mr-1">
                                    <NotificationBell isSidebar />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors duration-200"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {(user?.esPropietarioSaaS || ['CONFIG_VER', 'CONFIG_GENERAL', 'CONFIG_EMPRESA', 'CONFIG_SEGURIDAD', 'CONFIG_ASISTENCIA', 'CONFIG_RED', 'CONFIG_REPORTES'].some(permiso => hasPermission(permiso))) && (
                            <nav className="space-y-1">
                                {renderMenuButton({
                                    id: 'configuracion',
                                    nombre: 'Configuración',
                                    icono: Settings,
                                    ruta: '/configuracion'
                                })}
                            </nav>
                        )}
                    </div>
            </aside>
            {confirmAction && <ConfirmBox message={confirmAction.message} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} />}
        </>
    );
};

const OfflineIndicator = ({ isCollapsed }) => {
    const { isOffline } = useNetwork();

    if (!isOffline) return null;

    return (
        <div className={`
            bg-red-500 text-white flex items-center justify-center
            transition-all duration-300 overflow-hidden
            ${isCollapsed ? 'h-8' : 'h-8 px-2'}
        `}
            title="Sin conexión a internet"
        >
            <WifiOff className="w-4 h-4" />
            {!isCollapsed && (
                <span className="ml-2 text-xs font-bold whitespace-nowrap">
                    MODO OFFLINE
                </span>
            )}
        </div>
    );
};

export default Sidebar;