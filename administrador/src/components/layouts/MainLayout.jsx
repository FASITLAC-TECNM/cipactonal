import { useEffect, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import SidebarWithAuth from '../Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useProfileHeader } from '../../context/ProfileHeaderContext';
import TypewriterTitle from '../common/TypewriterTitle';

// Configuración de páginas
const pageConfig = {
    '/': { titulo: 'Dashboard', descripcion: 'Resumen general del sistema' },
    '/dashboard': { titulo: 'Dashboard', descripcion: 'Resumen general del sistema' },
    '/empleados': { titulo: 'Empleados', descripcion: 'Gestión de empleados' },
    '/roles': { titulo: 'Roles', descripcion: 'Gestión de roles y permisos' },
    '/horarios': { titulo: 'Horarios', descripcion: 'Gestión de horarios' },
    '/departamentos': { titulo: 'Departamentos', descripcion: 'Gestión de departamentos' },
    '/dispositivos': { titulo: 'Dispositivos', descripcion: 'Gestión de dispositivos' },
    '/incidencias': { titulo: 'Incidencias', descripcion: 'Gestión de incidencias' },
    '/reportes': { titulo: 'Reportes', descripcion: 'Reportes y estadísticas' },
    '/configuracion': { titulo: 'Configuración', descripcion: 'Configuración del sistema' },
    '/avisos': { titulo: 'Avisos', descripcion: 'Gestión de avisos y notificaciones' },
    '/registros': { titulo: 'Registros', descripcion: 'Historial de registros del sistema' },
};

const getPageConfig = (pathname) => {
    if (pageConfig[pathname]) return pageConfig[pathname];
    if (pathname.startsWith('/empleados/usuario/')) {
        return { titulo: 'Perfil de Usuario', descripcion: 'Información detallada del usuario' };
    }
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        const generatedTitle = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/[-_]/g, ' ');
        return { titulo: generatedTitle, descripcion: '' };
    }
    return { titulo: 'Página', descripcion: '' };
};

/**
 * Layout principal con autenticación y animación de header al entrar a perfiles
 */
const MainLayout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const { headerState, resetProfileHeader } = useProfileHeader();
    const headerRef = useRef(null);
    const prevPathRef = useRef(location.pathname);

    const isImpersonating = !!localStorage.getItem('saas_auth_token');
    const isProfilePage = location.pathname.startsWith('/empleados/usuario/');

    // Reset del contexto cuando salimos de la página de perfil
    useEffect(() => {
        const prev = prevPathRef.current;
        prevPathRef.current = location.pathname;

        const wasProfile = prev.startsWith('/empleados/usuario/');
        const isNowProfile = location.pathname.startsWith('/empleados/usuario/');

        if (wasProfile && !isNowProfile) {
            resetProfileHeader();
        }
    }, [location.pathname, resetProfileHeader]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const currentPage = getPageConfig(location.pathname);

    const handleTerminarImpersonacion = () => {
        const saasToken = localStorage.getItem('saas_auth_token');
        if (saasToken) {
            localStorage.setItem('auth_token', saasToken);
            localStorage.removeItem('saas_auth_token');
            window.location.href = '/dashboard';
        }
    };

    // Clases del header según estado
    // - En página de perfil: empieza pequeño (76px) mientras carga, crece a 160px cuando los datos están
    // - En otras páginas: tamaño fijo 76px
    const headerHeightClass = (() => {
        if (!isProfilePage) return 'h-[76px] items-center justify-between';
        if (headerState === 'ready') return 'profile-header-expanded';
        // loading o idle → tamaño compacto mientras espera
        return 'h-[76px] items-center justify-between';
    })();

    return (
        <div className="relative flex bg-slate-50 dark:bg-[#111110] h-screen overflow-hidden transition-colors duration-300 select-none">
            {/* Fondo gradiente sutil y moderno */}
            <div className="-z-10 absolute inset-0 bg-gradient-to-br from-amber-50/20 via-white to-orange-50/15 dark:from-[#111110] dark:via-[#111110] dark:to-[#111110] pointer-events-none" />

            {/* Sidebar con autenticación */}
            <SidebarWithAuth />

            {/* Contenido principal */}
            <main className="relative flex flex-col flex-1 overflow-hidden">
                {/* Banner de Impersonación */}
                {isImpersonating && (
                    <div className="z-30 flex justify-between items-center bg-red-600 shadow-md px-6 py-2 text-white">
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <span className="relative flex w-2 h-2">
                                <span className="inline-flex absolute bg-red-400 opacity-75 rounded-full w-full h-full animate-ping"></span>
                                <span className="inline-flex relative bg-white rounded-full w-2 h-2"></span>
                            </span>
                            MODO IMPERSONACIÓN: Estás operando como Administrador del Tenant
                        </div>
                        <button
                            onClick={handleTerminarImpersonacion}
                            className="bg-white hover:bg-red-50 shadow-sm px-3 py-1 rounded font-bold text-red-600 text-xs transition-colors"
                        >
                            Volver al Panel SaaS
                        </button>
                    </div>
                )}

                {/* 
                    Header animado.
                    - Transición CSS en height y padding para que el crecimiento sea suave.
                    - overflow-hidden durante la expansión para que el contenido no "salte".
                */}
                <header
                    ref={headerRef}
                    className={`
                        z-20 flex
                        bg-white dark:bg-[#1a1a18]
                        shadow-card dark:shadow-card-dark
                        mx-4 lg:mx-8 mt-4 lg:mt-6 mb-2 lg:mb-4
                        px-6 md:px-8
                        border border-slate-200/50 dark:border-[#2a2a27]
                        rounded-3xl shrink-0
                        ${headerHeightClass}
                        ${isProfilePage ? 'header-profile-transition overflow-hidden' : 'transition-all duration-300'}
                    `}
                >
                    {isProfilePage ? (
                        // Mientras carga: placeholder pulsante
                        // Cuando listo: el portal inyecta el contenido real
                        <>
                            <div id="header-profile-portal" className="w-full" />
                            {headerState !== 'ready' && (
                                <div className="absolute inset-0 flex items-center px-6 md:px-8 gap-4 pointer-events-none">
                                    {/* Skeleton de avatar */}
                                    <div className="w-10 h-10 rounded-full bg-slate-200/70 dark:bg-slate-700/50 animate-pulse shrink-0" />
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <div className="h-4 w-40 rounded-lg bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                                        <div className="h-3 w-24 rounded-lg bg-slate-200/50 dark:bg-slate-700/30 animate-pulse" />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex-shrink-0 min-w-[150px]">
                                <h1 className="mb-1 font-extrabold text-slate-800 dark:text-white text-xl leading-none tracking-tight">
                                    <TypewriterTitle text={currentPage.titulo} />
                                </h1>
                                {(location.pathname === '/' || location.pathname === '/dashboard') && (
                                    <p className="font-bold text-[12px] text-blue-600 dark:text-blue-400 tracking-wide">
                                        {getGreeting()}, {user?.usuario?.nombre?.split(' ')[0] || 'Usuario'}.
                                    </p>
                                )}
                            </div>

                            {/* Portal Area for Toolbars */}
                            <div id="header-actions-portal" className="flex flex-1 justify-end items-center gap-3 px-4 min-w-0"></div>
                        </>
                    )}
                </header>

                {/* Contenido */}
                <div className="flex flex-col flex-1 mx-auto p-6 md:p-8 w-full max-w-8xl overflow-hidden">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;