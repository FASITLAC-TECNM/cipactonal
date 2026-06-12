import { useEffect, useRef, useState } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import SidebarWithAuth from '../Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useProfileHeader } from '../../context/ProfileHeaderContext';
import TypewriterTitle from '../common/TypewriterTitle';
import NotificationBell from '../NotificationBell';
import ConfirmBox from '../ConfirmBox';
import { LogOut } from 'lucide-react';

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
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { headerState, resetProfileHeader } = useProfileHeader();
    const headerRef = useRef(null);
    const prevPathRef = useRef(location.pathname);
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
    // - En página de perfil: empieza pequeño (min-h-[68px]) mientras carga, crece a 160px cuando los datos están
    // - En otras páginas: altura automática con mínimo definido
    const headerHeightClass = (() => {
        if (!isProfilePage) return 'min-h-[60px] sm:min-h-[68px] lg:min-h-[76px] items-center justify-between';
        if (headerState === 'ready') return 'profile-header-expanded';
        // loading o idle → tamaño compacto mientras espera
        return 'min-h-[60px] sm:min-h-[68px] lg:min-h-[76px] items-center justify-between';
    })();

    return (
        <div className="relative flex bg-slate-50 dark:bg-[#111110] h-[100dvh] overflow-hidden transition-colors duration-300 select-none">
            {/* Fondo gradiente sutil y moderno */}
            <div className="-z-10 absolute inset-0 bg-gradient-to-br from-amber-50/20 via-white to-orange-50/15 dark:from-[#111110] dark:via-[#111110] dark:to-[#111110] pointer-events-none" />

            {/* Sidebar con autenticación */}
            <SidebarWithAuth />

            {/* Contenido principal */}
            <main className="relative flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Banner de Impersonación */}
                {isImpersonating && (
                    <div className="z-30 flex flex-col sm:flex-row justify-between items-center bg-red-500/95 dark:bg-red-600/90 backdrop-blur-md shadow-lg shadow-red-500/20 dark:shadow-red-900/20 mx-3 sm:mx-4 lg:mx-8 mt-3 sm:mt-4 lg:mt-6 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-white rounded-xl sm:rounded-2xl border border-red-400/50 dark:border-red-500/30 gap-2 sm:gap-3 shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3 font-bold text-xs sm:text-sm min-w-0">
                            <span className="relative flex w-2.5 h-2.5 shrink-0">
                                <span className="inline-flex absolute bg-red-200 opacity-75 rounded-full w-full h-full animate-ping"></span>
                                <span className="inline-flex relative bg-white rounded-full w-2.5 h-2.5"></span>
                            </span>
                            <span className="leading-tight truncate">MODO IMPERSONACIÓN: Estás operando como Administrador del Tenant</span>
                        </div>
                        <button
                            onClick={handleTerminarImpersonacion}
                            className="bg-white hover:bg-red-50 text-red-600 shadow-sm px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            Volver al Panel SaaS
                        </button>
                    </div>
                )}

                {/* 
                    Header animado.
                    - Altura automática (min-height) para acomodar cualquier cantidad de controles.
                    - Transición CSS en height y padding para que el crecimiento sea suave.
                */}
                <header
                    ref={headerRef}
                    className={`
                        z-20 flex
                        bg-white dark:bg-[#1a1a18]
                        shadow-card dark:shadow-card-dark
                        mx-3 sm:mx-4 lg:mx-8
                        mt-3 sm:mt-4 lg:mt-6
                        mb-0
                        px-4 sm:px-5 md:px-6 lg:px-8
                        py-2 sm:py-2.5
                        border border-slate-200/50 dark:border-[#2a2a27]
                        rounded-2xl sm:rounded-3xl shrink-0
                        ${headerHeightClass}
                        ${isProfilePage ? 'header-profile-transition overflow-hidden' : 'transition-all duration-300'}
                    `}
                >
                    {isProfilePage ? (
                        // Cuando listo: el portal inyecta el contenido real
                        <>
                            <div id="header-profile-portal" className="w-full" />
                            {headerState !== 'ready' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex-shrink-0 flex items-center" style={{minWidth: '120px'}}>
                                <div>
                                    <h1 className="font-extrabold text-slate-800 dark:text-white text-base sm:text-lg lg:text-xl leading-none tracking-tight">
                                        <TypewriterTitle text={currentPage.titulo} />
                                    </h1>
                                    {(location.pathname === '/' || location.pathname === '/dashboard') && (
                                        <p className="font-bold text-[11px] sm:text-[12px] text-primary-600 dark:text-primary-400 tracking-wide mt-0.5">
                                            {getGreeting()}, {user?.usuario?.nombre?.split(' ')[0] || 'Usuario'}.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Portal Area for Toolbars — sin flex-wrap, controles secundarios van al SubToolbar */}
                            <div id="header-actions-portal" className="flex flex-1 justify-end items-center gap-2 sm:gap-3 min-w-0 overflow-hidden"></div>
                            
                            {/* Acciones móviles */}
                            <div className="lg:hidden flex items-center gap-1.5 flex-shrink-0 ml-2">
                                <div className="flex items-center justify-center -mr-1">
                                    <NotificationBell isSidebar={false} />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors duration-200"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => navigate(`/empleados/usuario/${user?.usuario?.usuario}`)}
                                    className="w-8 h-8 bg-slate-100 dark:bg-[#2a2a27] rounded-full flex items-center justify-center text-slate-700 dark:text-[#e8e8e4] font-bold text-xs shadow-inner overflow-hidden border border-slate-200 dark:border-[#363632]"
                                >
                                    {user?.usuario?.foto ? (
                                        <img src={user.usuario.foto} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{user?.usuario?.nombre?.substring(0, 2).toUpperCase() || '?'}</span>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </header>

                {/* Sub-Toolbar Portal — segunda barra para controles secundarios */}
                <div
                    id="sub-toolbar-portal"
                    className="
                        sub-toolbar-portal
                        mx-3 sm:mx-4 lg:mx-8
                        mt-2
                        bg-white/90 dark:bg-[#1a1a18]/90
                        backdrop-blur-sm
                        border border-slate-200/50 dark:border-[#2a2a27]/80
                        rounded-xl sm:rounded-2xl
                        px-4 sm:px-5 md:px-6
                        py-2
                        shadow-sm
                        shrink-0
                        empty:hidden
                    "
                />

                {/* Espaciado debajo del bloque header + sub-toolbar */}
                <div className="mb-2 sm:mb-3 lg:mb-4 shrink-0" />

                {/* Contenido — padding-bottom en móvil para la barra inferior */}
                <div className="flex flex-col flex-1 mx-3 sm:mx-4 lg:mx-8 mb-3 sm:mb-4 lg:mb-6 pb-20 lg:pb-0 min-h-0 overflow-hidden">
                    {children || <Outlet />}
                </div>
            </main>
            {confirmAction && <ConfirmBox message={confirmAction.message} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} />}
        </div>
    );
};

export default MainLayout;