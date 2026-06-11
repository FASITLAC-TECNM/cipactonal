import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/Apiconfig';
import { FiGlobe, FiSearch, FiPlus, FiArrowRight, FiActivity, FiLogIn } from 'react-icons/fi';
import DynamicLoader from '../components/common/DynamicLoader';
import Pagination from '../components/Pagination';
import NuevaEmpresaModal from '../components/NuevaEmpresaModal';

const EmpresasSaaS = () => {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para Modal Nuevo Tenant

    // Paginación
    const [pagina, setPagina] = useState(1);
    const elementosPorPagina = 9;

    const API_URL = API_CONFIG.BASE_URL;

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_URL}/api/empresas`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al obtener las empresas');
                }

                setEmpresas(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEmpresas();
    }, [API_URL]);

    const handleImpersonate = async (empresaId) => {
        try {
            const token = localStorage.getItem('auth_token');
            // Guardamos el token SaaS original para poder regresar
            localStorage.setItem('saas_auth_token', token);

            const res = await fetch(`${API_URL}/api/auth/impersonate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ empresa_id: empresaId })
            });
            const data = await res.json();

            if (data.success) {
                // Sobrescribir el token con el token impersonado
                localStorage.setItem('auth_token', data.data.token);
                // Forzar recarga completa para limpiar estados de React (Redux/Contextos) y arrancar en modo Tenant
                window.location.href = '/dashboard';
            } else {
                alert(data.message || 'Error al impersonar empresa');
            }
        } catch (err) {
            console.error('Error en impersonación:', err);
            alert('Error de conexión al intentar ingresar a la empresa');
        }
    };

    const handleEmpresaCreada = (nuevaEmpresa) => {
        // Añadir la nueva empresa al inicio del listado y cerrar modal
        setEmpresas(prev => [nuevaEmpresa, ...prev]);
        setSearchTerm('');
        setPagina(1);
    };

    // Filtrar localmente por búsqueda
    const filteredEmpresas = empresas.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.identificador && e.identificador.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Calcular páginas a partir de los elementos filtrados
    const totalPaginas = Math.ceil(filteredEmpresas.length / elementosPorPagina);
    const empresasPaginadas = filteredEmpresas.slice(
        (pagina - 1) * elementosPorPagina,
        pagina * elementosPorPagina
    );

    // Reiniciar a página 1 cuando se realiza una búsqueda
    useEffect(() => {
        setPagina(1);
    }, [searchTerm]);

    if (loading) return <DynamicLoader text="Cargando panel maestro..." />;

    return (
        <div className="select-none space-y-6 animate-fade-in-up">

            {/* Controles Principales */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-md">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#a0a09a] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o identificador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-12"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                    <FiPlus className="w-5 h-5" /> Registrar Nueva Empresa
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                    <FiActivity className="w-5 h-5" /> {error}
                </div>
            )}

            {/* Listado Principal de Empresas SaaS */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-[#e8e8e4] mb-6">Directorio de Entidades</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {empresasPaginadas.map((empresa, index) => (
                        <div key={empresa.id} 
                            className="card p-0 overflow-hidden flex flex-col group relative min-h-[160px] hover:-translate-y-1 transition-all animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Decoración superior sutil */}
                            <div className={`h-1.5 w-full ${empresa.es_activo ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} />

                            <div className="p-5 flex-grow flex flex-col justify-start">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 pr-3">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-[#e8e8e4] mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                                            {empresa.nombre}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-[#a0a09a] font-mono tracking-tight">
                                            {empresa.identificador || 'Sin ID'}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${empresa.es_activo ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50'}`}>
                                        {empresa.es_activo ? 'Activo' : 'Suspendido'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex px-4 py-3 bg-slate-50 dark:bg-[#1e1e1c]/50 border-t border-slate-100/50 dark:border-[#2a2a27]/50 justify-between gap-3">
                                <button
                                    onClick={() => handleImpersonate(empresa.id)}
                                    title="Entrar como Administrador de esta empresa"
                                    className="flex-1 px-3 py-1.5 bg-white dark:bg-[#2a2a27] border border-slate-200 dark:border-[#3a3a36] hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 text-slate-700 dark:text-[#e8e8e4] rounded-lg transition-colors text-xs font-semibold flex justify-center items-center gap-1 shadow-sm"
                                >
                                    <FiLogIn className="w-3.5 h-3.5" /> Entrar
                                </button>

                                <button
                                    onClick={() => navigate(`/empresas/${empresa.id}`)}
                                    title="Configuración SaaS de la Empresa"
                                    className="flex-1 px-3 py-1.5 bg-white dark:bg-[#2a2a27] border border-slate-200 dark:border-[#3a3a36] hover:bg-slate-50 dark:hover:bg-[#363632] text-slate-700 dark:text-[#e8e8e4] rounded-lg transition-colors text-xs font-semibold flex justify-center items-center gap-1 shadow-sm"
                                >
                                    Ajustes <FiArrowRight className="w-3.5 h-3.5 opacity-60" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredEmpresas.length === 0 && !loading && (
                        <div className="col-span-full py-16 text-center border-dashed border-2 border-slate-200 dark:border-[#2a2a27] rounded-xl card bg-transparent shadow-none">
                            <FiSearch className="w-10 h-10 text-slate-300 dark:text-[#363632] mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-[#e8e8e4] mb-1">No hay resultados</h3>
                            <p className="text-slate-500 dark:text-[#a0a09a] text-sm">Prueba buscando con otro identificador.</p>
                        </div>
                    )}
                </div>

                {filteredEmpresas.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-[#2a2a27]">
                        <Pagination
                            pagina={pagina}
                            totalPaginas={totalPaginas}
                            total={filteredEmpresas.length}
                            porPagina={elementosPorPagina}
                            onChange={setPagina}
                        />
                    </div>
                )}
            </div>

            {/* Modal de Aprovisionamiento */}
            <NuevaEmpresaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onEmpresaCreada={handleEmpresaCreada}
            />
        </div>
    );
};

export default EmpresasSaaS;
