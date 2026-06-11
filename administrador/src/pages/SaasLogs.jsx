import { useState, useEffect } from 'react';
import { FiActivity, FiServer, FiAlertTriangle, FiInfo, FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';
import { API_CONFIG } from '../config/Apiconfig';
import DynamicLoader from '../components/common/DynamicLoader';
import { createPortal } from 'react-dom';
import Pagination from '../components/Pagination';

const LOG_ICONS = {
    info: <FiInfo className="w-5 h-5 text-blue-500" />,
    warn: <FiAlertTriangle className="w-5 h-5 text-yellow-500" />,
    error: <FiAlertTriangle className="w-5 h-5 text-red-500" />,
    critical: <FiActivity className="w-5 h-5 text-red-600 animate-pulse" />
};

const LOG_BADGES = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    warn: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    critical: 'bg-red-600 text-white shadow animate-pulse'
};

const ContextModal = ({ log, onClose }) => {
    if (!log) return null;
    return createPortal(
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-slate-900/60 dark:bg-[#1e1e1c]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="card p-0 w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden relative group shadow-2xl">
                {/* Decoración Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl rounded-full -mt-20 -mr-20 pointer-events-none"></div>

                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-[#3a3a36] bg-slate-50/50 dark:bg-[#2a2a27]/80 relative z-10">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-[#e8e8e4] flex items-center gap-3">
                        <div className="p-2 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 rounded-lg">
                            <FiServer className="w-5 h-5" />
                        </div>
                        Detalles de la Excepción
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-500 dark:text-[#a0a09a] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto font-mono text-sm bg-slate-950 text-green-400 shadow-inner relative z-10 selection:bg-green-800 selection:text-white">
                    <div className="flex items-center gap-2 mb-4 text-slate-500 text-xs border-b border-slate-800 pb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-2">system-log-terminal</span>
                    </div>
                    <pre className="whitespace-pre-wrap word-break-all leading-relaxed">
                        {JSON.stringify(JSON.parse(log.contexto), null, 2)}
                    </pre>
                </div>
            </div>
        </div>,
        document.body
    );
};

const SaasLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, paginas: 1 });
    const [filtroNivel, setFiltroNivel] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const url = new URL(`${API_CONFIG.BASE_URL}/api/saas/logs`);
            url.searchParams.append('page', page);
            url.searchParams.append('limit', meta.limit);
            if (filtroNivel) url.searchParams.append('nivel', filtroNivel);

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setLogs(data.data);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filtroNivel]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e8e8e4] flex items-center gap-3">
                        <FiServer className="text-primary-600 dark:text-primary-400" /> System Logs (SaaS)
                    </h1>
                    <p className="text-slate-500 dark:text-[#a0a09a] mt-1">
                        Bitácora general de Errores Globales de Tenants e Infraestructura
                    </p>
                </div>

                <select
                    value={filtroNivel}
                    onChange={(e) => setFiltroNivel(e.target.value)}
                    className="input max-w-xs cursor-pointer">
                    <option value="">Todos los niveles</option>
                    <option value="info">INFO</option>
                    <option value="warn">WARN</option>
                    <option value="error">ERROR</option>
                    <option value="critical">CRITICAL</option>
                </select>
            </div>

            <div className="card p-0 overflow-hidden relative group border-t border-slate-100 dark:border-[#3a3a36]">
                {/* Glow decorativo de tabla */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-primary-500/5 blur-3xl pointer-events-none"></div>

                <div className="overflow-x-auto min-h-[500px] relative z-10">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 dark:bg-[#2a2a27]/80 text-slate-500 dark:text-[#a0a09a] font-bold text-xs sticky top-0 backdrop-blur-md z-20 shadow-sm border-b border-slate-200 dark:border-[#3a3a36]">
                            <tr>
                                <th className="px-6 py-5 rounded-tl-[2rem]">FECHA/HORA</th>
                                <th className="px-6 py-5">NIVEL</th>
                                <th className="px-6 py-5">RUTA (ENDPOINT)</th>
                                <th className="px-6 py-5">MENSAJE</th>
                                <th className="px-6 py-5">TENANT</th>
                                <th className="px-6 py-5 text-center">CONTEXTO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#3a3a36] bg-white dark:bg-[#1e1e1c]">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <DynamicLoader text="Extrayendo registros..." />
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 dark:text-[#a0a09a]">
                                        No se encontraron registros de error.
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#2a2a27]/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500 dark:text-[#a0a09a] whitespace-nowrap">
                                            {new Date(log.fecha).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 w-max ${LOG_BADGES[log.nivel] || LOG_BADGES.info}`}>
                                                {LOG_ICONS[log.nivel] || LOG_ICONS.info} {log.nivel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-[#e8e8e4]">
                                            {log.ruta || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-[#e8e8e4] max-w-sm truncate">
                                            {log.mensaje}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.empresa_nombre ? (
                                                <div className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-[#2a2a27] border border-slate-200 dark:border-[#3a3a36] text-slate-700 dark:text-[#e8e8e4] rounded truncate max-w-[150px]">
                                                    {log.empresa_nombre}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-[#a0a09a]">Global</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {log.contexto ? (
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                                    title="Ver contexto">
                                                    <FiMaximize2 className="w-4 h-4 cursor-pointer" />
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 dark:text-[#3a3a36]">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {!loading && meta.paginas > 1 && (
                    <Pagination
                        pagina={meta.page}
                        totalPaginas={meta.paginas}
                        total={meta.total}
                        porPagina={meta.limit}
                        onChange={fetchLogs}
                    />
                )}
            </div>

            <ContextModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        </div>
    );
};

export default SaasLogs;
