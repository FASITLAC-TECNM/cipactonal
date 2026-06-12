import { useState, useEffect } from 'react';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheck,
    FiX,
    FiClock,
    FiAlertCircle,
    FiFilter,
    FiCalendar,
    FiUser,
    FiFileText
} from 'react-icons/fi';
import DynamicLoader from '../components/common/DynamicLoader';
import HeaderActions from '../components/HeaderActions';
import SubToolbar from '../components/SubToolbar';
import ConfirmBox from '../components/ConfirmBox';
import Pagination from '../components/Pagination';

import { API_CONFIG } from '../config/Apiconfig';
const API_URL = API_CONFIG.BASE_URL;

const Incidencias = () => {
    const [incidencias, setIncidencias] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRechazarModal, setShowRechazarModal] = useState(false);
    const [incidenciaToRechazar, setIncidenciaToRechazar] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);
    const [formData, setFormData] = useState({
        empleado_id: '',
        tipo: 'justificante',
        motivo: '',
        observaciones: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    // Paginación
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;

    // Filtros
    const [filtros, setFiltros] = useState({
        tipo: '',
        estado: '',
        empleado_id: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    useEffect(() => {
        fetchIncidencias();
        fetchEmpleados();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchIncidencias = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            // Construir query params
            const params = new URLSearchParams();
            if (filtros.tipo) params.append('tipo', filtros.tipo);
            if (filtros.estado) params.append('estado', filtros.estado);
            if (filtros.empleado_id) params.append('empleado_id', filtros.empleado_id);
            if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
            if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

            const response = await fetch(`${API_URL}/api/incidencias?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setIncidencias(data.data);
                setPagina(1);
            }
        } catch (error) {
            console.error('Error al cargar incidencias:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/empleados`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setEmpleados(data.data);
            }
        } catch (error) {
            console.error('Error al cargar empleados:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            const url = selectedIncidencia
                ? `${API_URL}/api/incidencias/${selectedIncidencia.id}`
                : `${API_URL}/api/incidencias`;

            const response = await fetch(url, {
                method: selectedIncidencia ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setAlertMsg(data.message);
                setShowModal(false);
                resetForm();
                fetchIncidencias();
            } else {
                setAlertMsg(data.message || 'Error al guardar incidencia');
            }
        } catch (error) {
            console.error('Error:', error);
            setAlertMsg('Error al guardar incidencia');
        }
    };

    const handleAprobar = (id) => {
        setConfirmAction({
            message: '¿Estás seguro de aprobar esta incidencia?',
            onConfirm: async () => {
                setConfirmAction(null);
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_URL}/api/incidencias/${id}/aprobar`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ observaciones: 'Aprobado' })
                    });

                    const data = await response.json();
                    if (data.success) {
                        setAlertMsg(data.message);
                        fetchIncidencias();
                    } else {
                        setAlertMsg(data.message || 'Error al aprobar');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    setAlertMsg('Error al aprobar incidencia');
                }
            }
        });
    };

    const openRechazarModal = (id) => {
        setIncidenciaToRechazar(id);
        setMotivoRechazo('');
        setShowRechazarModal(true);
    };

    const handleRechazar = async () => {
        if (!motivoRechazo.trim()) {
            setAlertMsg('Debes ingresar un motivo de rechazo');
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/incidencias/${incidenciaToRechazar}/rechazar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ observaciones: motivoRechazo })
            });

            const data = await response.json();
            if (data.success) {
                setAlertMsg(data.message);
                setShowRechazarModal(false);
                fetchIncidencias();
            } else {
                setAlertMsg(data.message || 'Error al rechazar');
            }
        } catch (error) {
            console.error('Error:', error);
            setAlertMsg('Error al rechazar incidencia');
        }
    };

    const resetForm = () => {
        setFormData({
            empleado_id: '',
            tipo: 'justificante',
            motivo: '',
            observaciones: '',
            fecha_inicio: '',
            fecha_fin: ''
        });
        setSelectedIncidencia(null);
    };

    const openEditModal = (incidencia) => {
        setSelectedIncidencia(incidencia);
        setFormData({
            empleado_id: incidencia.empleado_id,
            tipo: incidencia.tipo,
            motivo: incidencia.motivo || '',
            observaciones: incidencia.observaciones || '',
            fecha_inicio: incidencia.fecha_inicio?.split('T')[0] || '',
            fecha_fin: incidencia.fecha_fin?.split('T')[0] || ''
        });
        setShowModal(true);
    };

    const openDetailModal = (incidencia) => {
        setSelectedIncidencia(incidencia);
        setShowDetailModal(true);
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'pendiente': 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
            'aprobado': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
            'rechazado': 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/30'
        };
        return badges[estado] || 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/30';
    };

    const getTipoBadge = (tipo) => {
        const badges = {
            'retardo': 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/30',
            'justificante': 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
            'permiso': 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/30',
            'vacaciones': 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/30',
            'festivo': 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/30'
        };
        return badges[tipo] || 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/30';
    };

    const getTipoIcon = (tipo) => {
        const icons = {
            'retardo': <FiClock className="w-4 h-4" />,
            'justificante': <FiFileText className="w-4 h-4" />,
            'permiso': <FiAlertCircle className="w-4 h-4" />,
            'vacaciones': <FiCalendar className="w-4 h-4" />,
            'festivo': <FiCalendar className="w-4 h-4" />
        };
        return icons[tipo] || <FiFileText className="w-4 h-4" />;
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (nombre) => {
        if (!nombre) return '?';
        const parts = nombre.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    // Estadísticas
    const stats = {
        total: incidencias.length,
        pendientes: incidencias.filter(i => i.estado === 'pendiente').length,
        aprobadas: incidencias.filter(i => i.estado === 'aprobado').length,
        rechazadas: incidencias.filter(i => i.estado === 'rechazado').length
    };

    if (loading) {
        return <DynamicLoader text="Cargando incidencias..." />;
    }

    return (
        <div className="flex flex-col gap-6 h-full min-h-0">
            {/* Botón primario en el header */}
            <HeaderActions>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2 py-1.5 px-3 sm:px-4 text-sm shadow-sm transition-all"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nueva</span>
                    </button>
                </div>
            </HeaderActions>

            {/* Filtros en la barra secundaria */}
            <SubToolbar>
                <FiFilter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                    value={filtros.tipo}
                    onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                    className="input py-1 text-xs w-auto cursor-pointer bg-white/80 dark:bg-[#2a2a27]/80 border-slate-200/60 dark:border-[#3a3a36]"
                >
                    <option value="">Todos los tipos</option>
                    <option value="retardo">Retardo</option>
                    <option value="justificante">Justificante</option>
                    <option value="permiso">Permiso</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="festivo">Festivo</option>
                </select>

                <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    className="input py-1 text-xs w-auto cursor-pointer bg-white/80 dark:bg-[#2a2a27]/80 border-slate-200/60 dark:border-[#3a3a36]"
                >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                </select>

                <select
                    value={filtros.empleado_id}
                    onChange={(e) => setFiltros({ ...filtros, empleado_id: e.target.value })}
                    className="input py-1 text-xs w-auto cursor-pointer bg-white/80 dark:bg-[#2a2a27]/80 border-slate-200/60 dark:border-[#3a3a36]"
                >
                    <option value="">Todos los empleados</option>
                    {empleados.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                    ))}
                </select>

                <input
                    type="date"
                    value={filtros.fecha_inicio}
                    onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                    className="input py-1 text-xs w-auto cursor-pointer bg-white/80 dark:bg-[#2a2a27]/80 border-slate-200/60 dark:border-[#3a3a36]"
                    title="Fecha inicio"
                />

                <button
                    onClick={fetchIncidencias}
                    className="btn-secondary flex items-center gap-1.5 py-1 px-2.5 text-xs shadow-sm"
                    title="Aplicar Filtros"
                >
                    <FiFilter className="w-3.5 h-3.5" />
                </button>
            </SubToolbar>

            {/* Tabla de incidencias */}
            <div className="flex-1 min-h-0 flex flex-col card p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_24px,black_90%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_24px,black_90%,transparent_100%)]">
                {incidencias.length === 0 ? (
                    <div className="py-12 text-slate-500 dark:text-[#a0a09a] text-center">
                        <FiFileText className="mx-auto mb-4 w-16 h-16 text-slate-300 dark:text-[#706f69]" />
                        <p className="font-medium text-lg">No hay incidencias registradas</p>
                        <p className="text-sm mt-1">Comienza creando una nueva incidencia o ajusta los filtros</p>
                    </div>
                ) : (
                    <>
                        {/* Vista Móvil (Tarjetas) */}
                        <div className="md:hidden flex flex-col gap-3 pb-4">
                            {incidencias.slice((pagina - 1) * porPagina, pagina * porPagina).map((incidencia) => (
                                <div key={incidencia.id} className="bg-white dark:bg-[#1e1e1c] border border-slate-200 dark:border-[#2a2a27] rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {incidencia.empleado_foto ? (
                                                <img
                                                    src={incidencia.empleado_foto}
                                                    alt={incidencia.empleado_nombre}
                                                    className="rounded-full w-8 h-8 object-cover border border-slate-200 dark:border-[#3a3a36]"
                                                />
                                            ) : (
                                                <div className="flex justify-center items-center bg-blue-50 dark:bg-blue-900/20 rounded-full w-8 h-8 font-semibold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 text-xs">
                                                    {getInitials(incidencia.empleado_nombre)}
                                                </div>
                                            )}
                                            <span className="font-medium text-slate-900 dark:text-[#e8e8e4] text-sm truncate max-w-[150px]">
                                                {incidencia.empleado_nombre}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${getEstadoBadge(incidencia.estado)}`}>
                                            {incidencia.estado}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-[#171715] p-2.5 rounded-lg border border-slate-100 dark:border-[#2a2a27]">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${getTipoBadge(incidencia.tipo)}`}>
                                            {getTipoIcon(incidencia.tipo)}
                                            {incidencia.tipo}
                                        </span>
                                        <div className="flex flex-col text-[10px] text-slate-500 dark:text-[#a0a09a] text-right">
                                            <span><span className="text-slate-400 dark:text-[#706f69]">De:</span> {formatFecha(incidencia.fecha_inicio)}</span>
                                            <span><span className="text-slate-400 dark:text-[#706f69]">A:</span> {formatFecha(incidencia.fecha_fin)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#2a2a27]">
                                        <button
                                            onClick={() => openDetailModal(incidencia)}
                                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-[#a0a09a] dark:hover:text-blue-400 bg-slate-50 dark:bg-[#2a2a27] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-slate-200 dark:border-[#3a3a36] transition-colors"
                                            title="Ver detalles"
                                        >
                                            <FiFileText className="w-4 h-4" />
                                        </button>
                                        {incidencia.estado === 'pendiente' && (
                                            <>
                                                <button
                                                    onClick={() => openEditModal(incidencia)}
                                                    className="p-1.5 text-slate-500 hover:text-orange-500 dark:text-[#a0a09a] dark:hover:text-orange-400 bg-slate-50 dark:bg-[#2a2a27] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg border border-slate-200 dark:border-[#3a3a36] transition-colors"
                                                    title="Editar"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirm(incidencia)}
                                                    className="p-1.5 text-slate-500 hover:text-red-500 dark:text-[#a0a09a] dark:hover:text-red-400 bg-slate-50 dark:bg-[#2a2a27] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-slate-200 dark:border-[#3a3a36] transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vista Escritorio (Tabla original) */}
                        <div className="hidden md:block overflow-x-auto min-w-full">
                            <table className="divide-y divide-slate-200 dark:divide-[#2a2a27] min-w-full">
                            <thead className="bg-slate-50/50 dark:bg-[#1e1e1c]/50 backdrop-blur-sm sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-slate-500 dark:text-[#a0a09a] text-xs text-left uppercase tracking-wider">
                                        Empleado
                                    </th>
                                    <th className="px-6 py-3 font-medium text-slate-500 dark:text-[#a0a09a] text-xs text-left uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 font-medium text-slate-500 dark:text-[#a0a09a] text-xs text-left uppercase tracking-wider">
                                        Fechas
                                    </th>
                                    <th className="px-6 py-3 font-medium text-slate-500 dark:text-[#a0a09a] text-xs text-left uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 font-medium text-slate-500 dark:text-[#a0a09a] text-xs text-left uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-[#2a2a27]">
                                {incidencias.slice((pagina - 1) * porPagina, pagina * porPagina).map((incidencia) => (
                                    <tr key={incidencia.id} className="hover:bg-slate-50/80 dark:hover:bg-[#2a2a27]/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {incidencia.empleado_foto ? (
                                                    <img
                                                        src={incidencia.empleado_foto}
                                                        alt={incidencia.empleado_nombre}
                                                        className="rounded-full w-10 h-10 object-cover border border-slate-200 dark:border-[#3a3a36]"
                                                    />
                                                ) : (
                                                    <div className="flex justify-center items-center bg-blue-50 dark:bg-blue-900/20 rounded-full w-10 h-10 font-semibold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                                                        {getInitials(incidencia.empleado_nombre)}
                                                    </div>
                                                )}
                                                <div className="ml-3">
                                                    <div className="font-medium text-slate-900 dark:text-[#e8e8e4] text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {incidencia.empleado_nombre}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTipoBadge(incidencia.tipo)}`}>
                                                {getTipoIcon(incidencia.tipo)}
                                                {incidencia.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-[#a0a09a] text-sm whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <span><span className="text-slate-400 dark:text-[#706f69] text-xs">De:</span> {formatFecha(incidencia.fecha_inicio)}</span>
                                                <span><span className="text-slate-400 dark:text-[#706f69] text-xs">A:</span> {formatFecha(incidencia.fecha_fin)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(incidencia.estado)}`}>
                                                {incidencia.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openDetailModal(incidencia)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:text-[#706f69] dark:hover:text-blue-400 bg-white dark:bg-[#111110] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-slate-200 dark:border-[#2a2a27] transition-all shadow-sm"
                                                    title="Ver detalles"
                                                >
                                                    <FiFileText className="w-4 h-4" />
                                                </button>
                                                {incidencia.estado === 'pendiente' && (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(incidencia)}
                                                            className="p-1.5 text-slate-400 hover:text-orange-500 dark:text-[#706f69] dark:hover:text-orange-400 bg-white dark:bg-[#111110] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg border border-slate-200 dark:border-[#2a2a27] transition-all shadow-sm"
                                                            title="Editar"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAprobar(incidencia.id)}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:text-[#706f69] dark:hover:text-emerald-400 bg-white dark:bg-[#111110] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg border border-slate-200 dark:border-[#2a2a27] transition-all shadow-sm"
                                                            title="Aprobar"
                                                        >
                                                            <FiCheck className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openRechazarModal(incidencia.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 dark:text-[#706f69] dark:hover:text-red-400 bg-white dark:bg-[#111110] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-slate-200 dark:border-[#2a2a27] transition-all shadow-sm"
                                                            title="Rechazar"
                                                        >
                                                            <FiX className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}

                </div>
            </div>

            <div className="flex-shrink-0 mt-2">
                <Pagination
                    pagina={pagina}
                    totalPaginas={Math.ceil(incidencias.length / porPagina)}
                    total={incidencias.length}
                    porPagina={porPagina}
                    onChange={setPagina}
                />
            </div>

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md transition-colors duration-200">
                        <h2 className="mb-4 font-bold text-gray-900 dark:text-white text-xl">
                            {selectedIncidencia ? 'Editar Incidencia' : 'Nueva Incidencia'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Empleado *
                                </label>
                                <select
                                    value={formData.empleado_id}
                                    onChange={(e) => setFormData({ ...formData, empleado_id: e.target.value })}
                                    className="input"
                                    required
                                    disabled={!!selectedIncidencia}
                                >
                                    <option value="">Seleccionar empleado</option>
                                    {empleados.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Tipo *
                                </label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="input"
                                    required
                                >
                                    <option value="retardo">Retardo</option>
                                    <option value="justificante">Justificante</option>
                                    <option value="permiso">Permiso</option>
                                    <option value="vacaciones">Vacaciones</option>
                                    <option value="festivo">Festivo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Motivo
                                </label>
                                <textarea
                                    value={formData.motivo}
                                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                    className="input"
                                    rows="3"
                                    placeholder="Describe el motivo de la incidencia"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Observaciones
                                </label>
                                <textarea
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    className="input"
                                    rows="2"
                                    placeholder="Observaciones adicionales"
                                />
                            </div>

                            <div className="gap-4 grid grid-cols-2">
                                <div>
                                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Fecha Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha_inicio}
                                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Fecha Fin
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha_fin}
                                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-200 btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 btn-primary">
                                    {selectedIncidencia ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalles */}
            {showDetailModal && selectedIncidencia && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg transition-colors duration-200">
                        <h2 className="mb-4 font-bold text-gray-900 dark:text-white text-xl">Detalles de Incidencia</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Empleado</p>
                                <p className="font-medium dark:text-white">{selectedIncidencia.empleado_nombre}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Tipo</p>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTipoBadge(selectedIncidencia.tipo)}`}>
                                    {getTipoIcon(selectedIncidencia.tipo)}
                                    {selectedIncidencia.tipo}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Estado</p>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadge(selectedIncidencia.estado)}`}>
                                    {selectedIncidencia.estado}
                                </span>
                            </div>
                            {selectedIncidencia.motivo && (
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Motivo</p>
                                    <p className="dark:text-gray-300 text-sm">{selectedIncidencia.motivo}</p>
                                </div>
                            )}
                            {selectedIncidencia.observaciones && (
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Observaciones</p>
                                    <p className="dark:text-gray-300 text-sm">{selectedIncidencia.observaciones}</p>
                                </div>
                            )}
                            <div className="gap-4 grid grid-cols-2">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Fecha Inicio</p>
                                    <p className="font-medium dark:text-gray-200 text-sm">{formatFecha(selectedIncidencia.fecha_inicio)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Fecha Fin</p>
                                    <p className="font-medium dark:text-gray-200 text-sm">{formatFecha(selectedIncidencia.fecha_fin)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full btn-secondary"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Rechazar */}
            {showRechazarModal && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md transition-colors duration-200">
                        <h2 className="mb-4 font-bold text-gray-900 dark:text-white text-xl">Motivo de Rechazo</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Ingresa el motivo del rechazo:
                                </label>
                                <textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    className="w-full input"
                                    rows="3"
                                    placeholder="Ej. Fechas incorrectas, falta justificación..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRechazarModal(false)}
                                    className="flex-1 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-200 btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleRechazar}
                                    className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 border-none btn-primary"
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {alertMsg && <ConfirmBox message={alertMsg} onConfirm={() => setAlertMsg(null)} />}
            {confirmAction && <ConfirmBox message={confirmAction.message} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} />}
        </div>
    );
};

export default Incidencias;