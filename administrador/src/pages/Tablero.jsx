import { useState, useEffect } from 'react';
import { useViewTransitionNavigate } from '../hooks/useViewTransitionNavigate';
import {
    FiClock,
    FiAlertCircle,
    FiCheckCircle,
    FiUserPlus,
    FiFileText,
    FiMessageSquare,
    FiBell
} from 'react-icons/fi';
import { API_CONFIG } from '../config/Apiconfig';
import Pagination from '../components/Pagination';
import { useRealTime } from '../hooks/useRealTime';
import DynamicLoader from '../components/common/DynamicLoader';
import { useTour } from '../hooks/useTour';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import SaasDashboard from './SaasDashboard';

const API_URL = API_CONFIG.BASE_URL;

const Dashboard = () => {
    const { user, hasPermission } = useAuth();
    const { formatTime } = useConfig();
    const navigate = useViewTransitionNavigate();
    const [loading, setLoading] = useState(true);
    const [ultimasAsistencias, setUltimasAsistencias] = useState([]);
    const [paginaAsistencias, setPaginaAsistencias] = useState(1);
    const asistenciasPorPagina = 10;

    // Definición del Tour
    const tourSteps = [
        { element: '#dash-attendance-table', popover: { title: 'Registros Recientes', description: 'Visualiza las últimas entradas y salidas procesadas por el sistema en tiempo real.', side: "top" } }
    ];

    useTour('dashboard', tourSteps, !loading);

    useEffect(() => {
        if (!user?.esPropietarioSaaS) {
            fetchDashboardData();
        }
    }, [user]);

    // Actualización en tiempo real (Solo si no es SaaS)
    useRealTime(user?.esPropietarioSaaS ? {} : {
        'nueva-asistencia': () => {
            fetchDashboardData();
        }
    });

    if (user?.esPropietarioSaaS) {
        return <SaasDashboard />;
    }

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fecha de hoy para filtrar asistencias (formato local YYYY-MM-DD)
            const hoy = new Date();
            const fechaInicio = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

            // Cargar asistencias
            const asistenciasRes = await fetch(`${API_URL}/api/asistencias?fecha_inicio=${fechaInicio}&limit=100`, { headers });
            const asistenciasData = await asistenciasRes.json();

            const asistenciasHoy = asistenciasData.success ? asistenciasData.data : [];
            setUltimasAsistencias(asistenciasHoy);

        } catch (error) {
            console.error('Error al cargar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Paginación de asistencias
    const totalPaginasAsistencias = Math.ceil(ultimasAsistencias.length / asistenciasPorPagina);
    const asistenciasPaginadas = ultimasAsistencias.slice(
        (paginaAsistencias - 1) * asistenciasPorPagina,
        paginaAsistencias * asistenciasPorPagina
    );

    if (loading) {
        return <DynamicLoader text="Cargando tablero..." />;
    }

    return (
        <div className="select-none flex flex-col h-full gap-6 pb-2">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {new Date().toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Acciones Rápidas Horizontales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hasPermission('USUARIO_CREAR') && (
                    <button onClick={() => navigate('/empleados', { state: { openCreateModal: true } })} className="card flex items-center gap-3 p-4 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer text-left">
                        <div className="p-3 bg-blue-100/80 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                            <FiUserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Añadir Empleado</p>
                        </div>
                    </button>
                )}
                {hasPermission('REGISTRO_VER') && (
                    <button onClick={() => navigate('/registros')} className="card flex items-center gap-3 p-4 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer text-left">
                        <div className="p-3 bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                            <FiFileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Últimos Registros</p>
                        </div>
                    </button>
                )}
                {hasPermission('AVISO_VER') && (
                    <button onClick={() => navigate('/avisos')} className="card flex items-center gap-3 p-4 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer text-left">
                        <div className="p-3 bg-amber-100/80 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                            <FiBell className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Últimos Avisos</p>
                        </div>
                    </button>
                )}
                {hasPermission('AVISO_CREAR') && (
                    <button onClick={() => navigate('/avisos', { state: { openCreateModal: true } })} className="card flex items-center gap-3 p-4 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer text-left">
                        <div className="p-3 bg-purple-100/80 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                            <FiMessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Crear Aviso Rápido</p>
                        </div>
                    </button>
                )}
            </div>

            {/* Sección principal de últimas asistencias */}
            <div id="dash-attendance-table" className="card p-0 flex flex-col shadow-2xl border-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-3xl flex-1 min-h-0">
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                        Últimas Asistencias Registradas
                    </h3>
                </div>

                <div className="flex-1 overflow-auto">
                    {ultimasAsistencias.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-16 text-slate-500 dark:text-slate-400">
                            <FiClock className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600 opacity-50" />
                            <p className="text-lg font-medium">No hay asistencias registradas el día de hoy</p>
                        </div>
                    ) : (
                        <div className="w-full min-w-[800px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[30%] border-b border-slate-200/50 dark:border-slate-800/50">
                                            Empleado
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[15%] border-b border-slate-200/50 dark:border-slate-800/50">
                                            Tipo
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[15%] border-b border-slate-200/50 dark:border-slate-800/50">
                                            Hora
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[25%] border-b border-slate-200/50 dark:border-slate-800/50">
                                            Estado
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[15%] border-b border-slate-200/50 dark:border-slate-800/50">
                                            Dispositivo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                                    {asistenciasPaginadas.map((asistencia) => (
                                        <tr 
                                            key={asistencia.id} 
                                            className="hover:bg-white/80 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group" 
                                            onClick={() => navigate(`/empleados/usuario/${asistencia.empleado_usuario}`)}
                                        >
                                            {/* Empleado */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold group-hover:ring-2 ring-blue-500/30 transition-all">
                                                        {asistencia.empleado_nombre?.substring(0, 2).toUpperCase() || '?'}
                                                    </div>
                                                    <div className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {asistencia.empleado_nombre}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tipo */}
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${asistencia.tipo === 'entrada'
                                                    ? 'bg-blue-100/80 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                                    : 'bg-purple-100/80 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                                                    }`}>
                                                    {asistencia.tipo === 'entrada' ? '→ Entrada' : '← Salida'}
                                                </span>
                                            </td>

                                            {/* Hora */}
                                            <td className="px-8 py-5">
                                                <div className="text-base font-medium text-slate-600 dark:text-slate-300 font-mono">
                                                    {formatTime(asistencia.fecha_registro)}
                                                </div>
                                            </td>

                                            {/* Estado */}
                                            <td className="px-8 py-5">
                                                {(() => {
                                                    const e = asistencia.estado;
                                                    const map = {
                                                        puntual: { cls: 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', icon: <FiCheckCircle className="w-4 h-4 shrink-0" />, label: 'Puntual' },
                                                        salida_puntual: { cls: 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', icon: <FiCheckCircle className="w-4 h-4 shrink-0" />, label: 'Salida Puntual' },
                                                        salida_temprana: { cls: 'bg-amber-100/80 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300', icon: <FiClock className="w-4 h-4 shrink-0" />, label: 'Salida Temprana' },
                                                        salida_fuera_horario: { cls: 'bg-orange-100/80 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300', icon: <FiAlertCircle className="w-4 h-4 shrink-0" />, label: 'Fuera Horario' },
                                                        entrada_temprana: { cls: 'bg-cyan-100/80 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300', icon: <FiClock className="w-4 h-4 shrink-0" />, label: 'Entrada Temprana' },
                                                        retardo: { cls: 'bg-red-100/80 dark:bg-red-500/20 text-red-700 dark:text-red-300', icon: <FiClock className="w-4 h-4 shrink-0" />, label: 'Retardo' },
                                                        falta: { cls: 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300', icon: <FiAlertCircle className="w-4 h-4 shrink-0" />, label: 'Falta' },
                                                    };
                                                    const info = map[e] || { cls: 'bg-slate-100/80 dark:bg-slate-800 text-slate-800 dark:text-slate-300', icon: <FiClock className="w-4 h-4 shrink-0" />, label: e };
                                                    return (
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold max-w-full truncate ${info.cls}`} title={info.label}>
                                                            {info.icon} {info.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            {/* Dispositivo */}
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
                                                    {asistencia.dispositivo_origen}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30">
                    <Pagination
                        pagina={paginaAsistencias}
                        totalPaginas={totalPaginasAsistencias}
                        total={ultimasAsistencias.length}
                        porPagina={asistenciasPorPagina}
                        onChange={setPaginaAsistencias}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
