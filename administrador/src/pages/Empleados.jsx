import { useState, useEffect } from 'react';
import {
    FiPlus, FiSearch, FiUser
} from 'react-icons/fi';
import DynamicLoader from '../components/common/DynamicLoader';
import ConfirmBox from '../components/ConfirmBox';
import Pagination from '../components/Pagination';
import { useViewTransitionNavigate } from '../hooks/useViewTransitionNavigate';
import UserCard from '../components/cards/UserCard';
import UserModal from '../components/modals/UserModal';
import { useRealTime } from '../hooks/useRealTime';
import HeaderActions from '../components/HeaderActions';
import { useAuth } from '../context/AuthContext';

import { API_CONFIG } from '../config/Apiconfig';
const API_URL = API_CONFIG.BASE_URL;

const Empleados = () => {
    const navigate = useViewTransitionNavigate();
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('USUARIO_CREAR');

    // --- ESTADOS DE DATOS ---
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    // --- FILTROS ---
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('activo');

    // --- PAGINACIÓN ---
    const [pagina, setPagina] = useState(1);
    const porPagina = 16;

    // --- ESTADOS DEL MODAL ---
    const [modalConfig, setModalConfig] = useState({
        open: false,
        mode: 'create', // 'create' | 'edit'
        data: null
    });

    // --- EFECTOS ---
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busqueda, filtroEstado]);

    useRealTime({
        'usuario-actualizado': () => fetchData(), // Updates fields like role, name
        'empleado-actualizado': () => fetchData(), // Updates fields like rfc, schedule
        'usuario-creado': () => fetchData() // If someone else creates a user
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const params = new URLSearchParams();
            if (busqueda) params.append('buscar', busqueda);
            if (filtroEstado) params.append('estado', filtroEstado);

            // Fetch paralelo eficiente
            const [usuariosRes, rolesRes, horariosRes, departamentosRes] = await Promise.all([
                fetch(`${API_URL}/api/usuarios?${params}`, { headers }),
                fetch(`${API_URL}/api/roles`, { headers }),
                fetch(`${API_URL}/api/horarios`, { headers }),
                fetch(`${API_URL}/api/departamentos?es_activo=true`, { headers })
            ]);

            const [uData, rData, hData, dData] = await Promise.all([
                usuariosRes.json(), rolesRes.json(), horariosRes.json(), departamentosRes.json()
            ]);

            if (uData.success) { setUsuarios(uData.data); setPagina(1); }
            if (rData.success) setRoles(rData.data);
            if (hData.success) setHorarios(hData.data);
            if (dData.success) setDepartamentos(dData.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS DEL MODAL ---
    const handleOpenCreate = () => {
        setModalConfig({ open: true, mode: 'create', data: null });
    };

    const handleOpenEdit = async (usuario) => {
        try {
            // Obtenemos el detalle completo del usuario antes de abrir el modal
            // para asegurar que tenemos todos los campos actualizados
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success) {
                setModalConfig({ open: true, mode: 'edit', data: result.data });
            }
        } catch (error) {
            console.error('Error al cargar detalle usuario:', error);
        }
    };

    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, open: false }));
    };

    const handleModalSuccess = () => {
        fetchData();
    };

    const handleDelete = (usuario) => {
        setConfirmAction({
            message: `¿Dar de baja al usuario "${usuario.nombre}"?`,
            onConfirm: async () => {
                setConfirmAction(null);
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const result = await response.json();
                    if (result.success) fetchData();
                    else setAlertMsg(result.message || 'Error al dar de baja');
                } catch (error) { console.error(error); }
            }
        });
    };

    const handleReactivar = (usuario) => {
        setConfirmAction({
            message: `¿Reactivar al usuario "${usuario.nombre}"?`,
            onConfirm: async () => {
                setConfirmAction(null);
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}/reactivar`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const result = await response.json();
                    if (result.success) fetchData();
                    else setAlertMsg(result.message || 'Error al reactivar');
                } catch (error) { console.error(error); }
            }
        });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* Toolbar in Header */}
            <HeaderActions>
                <div className="flex items-center gap-3 w-full justify-end">
                    <div className="relative max-w-xs w-full hidden md:block">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input pl-9 py-1.5 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800"
                        />
                    </div>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="input py-1.5 text-sm w-auto cursor-pointer bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 hidden sm:block"
                    >
                        <option value="">Todos</option>
                        <option value="activo">Activo</option>
                        <option value="suspendido">Suspendido</option>
                        <option value="baja">Baja</option>
                    </select>
                    {canCreate && (
                        <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2 py-1.5 px-4 text-sm shadow-sm hover:shadow-md transition-all">
                            <FiPlus className="w-4 h-4" /> Nuevo
                        </button>
                    )}
                </div>
            </HeaderActions>

            {/* LISTA DE USUARIOS */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                {loading ? (
                    <DynamicLoader text="Cargando empleados..." />
                ) : usuarios.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p>No se encontraron usuarios</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up">
                        {usuarios.slice((pagina - 1) * porPagina, pagina * porPagina).map(usuario => (
                            <UserCard
                                key={usuario.id}
                                usuario={usuario}
                                onEdit={handleOpenEdit}
                                onDelete={handleDelete}
                                onReactivar={handleReactivar}
                                onViewProfile={() => navigate(`/empleados/usuario/${usuario.usuario}`, { state: { preloadedUser: usuario } })}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Paginación */}
            <Pagination
                pagina={pagina}
                totalPaginas={Math.ceil(usuarios.length / porPagina)}
                total={usuarios.length}
                porPagina={porPagina}
                onChange={setPagina}
            />

            {alertMsg && <ConfirmBox message={alertMsg} onConfirm={() => setAlertMsg(null)} />}
            {confirmAction && <ConfirmBox message={confirmAction.message} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} />}

            {/* Nuevo Componente Modal */}
            <UserModal
                isOpen={modalConfig.open}
                onClose={handleCloseModal}
                mode={modalConfig.mode}
                userToEdit={modalConfig.data}
                onSuccess={handleModalSuccess}
                rolesList={roles}
                horariosList={horarios}
                departamentosList={departamentos}
            />
        </div>
    );
};

export default Empleados;