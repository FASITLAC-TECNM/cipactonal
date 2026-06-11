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
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'aprobado': 'bg-green-100 text-green-800',
            'rechazado': 'bg-red-100 text-red-800'
        };
        return badges[estado] || 'bg-gray-100 text-gray-800';
    };

    const getTipoBadge = (tipo) => {
        const badges = {
            'retardo': 'bg-orange-100 text-orange-800',
            'justificante': 'bg-blue-100 text-blue-800',
            'permiso': 'bg-purple-100 text-purple-800',
            'vacaciones': 'bg-teal-100 text-teal-800',
            'festivo': 'bg-pink-100 text-pink-800'
        };
        return badges[tipo] || 'bg-gray-100 text-gray-800';
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
        <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-gray-900 dark:text-white text-2xl">Incidencias</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Gestiona justificantes, permisos y vacaciones
                    </p>
                </div>
            </div>

            {/* Toolbar in Header */}
            <HeaderActions>
                <div className="flex items-center gap-3 w-full justify-end">
                    <select
                        value={filtros.estado}
                        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                        className="input py-1.5 text-sm w-auto cursor-pointer bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 hidden md:block"
                    >
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="rechazado">Rechazado</option>
                    </select>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2 py-1.5 px-4 text-sm shadow-sm transition-all"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nuevo</span>
                    </button>
                </div>
            </HeaderActions>

            {/* Estadísticas */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-4">
                <div className="card">
                    <p className="mb-1 text-gray-600 dark:text-gray-400 text-sm">Total</p>
                    <p className="font-bold text-gray-900 dark:text-white text-3xl">{stats.total}</p>
                </div>
                <div className="card">
                    <p className="mb-1 text-gray-600 dark:text-gray-400 text-sm">Pendientes</p>
                    <p className="font-bold text-yellow-600 dark:text-yellow-500 text-3xl">{stats.pendientes}</p>
                </div>
                <div className="card">
                    <p className="mb-1 text-gray-600 dark:text-gray-400 text-sm">Aprobadas</p>
                    <p className="font-bold text-green-600 dark:text-green-500 text-3xl">{stats.aprobadas}</p>
                </div>
                <div className="card">
                    <p className="mb-1 text-gray-600 dark:text-gray-400 text-sm">Rechazadas</p>
                    <p className="font-bold text-red-600 dark:text-red-500 text-3xl">{stats.rechazadas}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <FiFilter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Filtros</h3>
                </div>
                <div className="gap-4 grid grid-cols-1 md:grid-cols-5">
                    <select
                        value={filtros.tipo}
                        onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                        className="input"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="retardo">Retardo</option>
                        <option value="justificante">Justificante</option>
                        <option value="permiso">Permiso</option>
                        <option value="vacaciones">Vacaciones</option>
                        <option value="festivo">Festivo</option>
                    </select>

                    {/* Filtro de estado movido al Header */}
                    <select
                        value={filtros.empleado_id}
                        onChange={(e) => setFiltros({ ...filtros, empleado_id: e.target.value })}
                        className="input"
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
                        className="input"
                        placeholder="Fecha inicio"
                    />

                    <button
                        onClick={fetchIncidencias}
                        className="btn-primary"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>

            {/* Tabla de incidencias */}
            <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                {incidencias.length === 0 ? (
                    <div className="py-12 text-gray-500 dark:text-gray-400 text-center">
                        <FiFileText className="mx-auto mb-4 w-16 h-16 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium text-lg">No hay incidencias registradas</p>
                        <p className="text-sm">Comienza creando una nueva incidencia</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="divide-y divide-gray-200 dark:divide-gray-700 min-w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300 text-xs text-left uppercase">
                                        Empleado
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300 text-xs text-left uppercase">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300 text-xs text-left uppercase">
                                        Fecha Inicio
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300 text-xs text-left uppercase">
                                        Fecha Fin
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300 text-xs text-left uppercase">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300 text-xs text-left uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {incidencias.slice((pagina - 1) * porPagina, pagina * porPagina).map((incidencia) => (
                                    <tr key={incidencia.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {incidencia.empleado_foto ? (
                                                    <img
                                                        src={incidencia.empleado_foto}
                                                        alt={incidencia.empleado_nombre}
                                                        className="rounded-full w-10 h-10 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex justify-center items-center bg-primary-100 rounded-full w-10 h-10 font-semibold text-primary-700">
                                                        {getInitials(incidencia.empleado_nombre)}
                                                    </div>
                                                )}
                                                <div className="ml-3">
                                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {incidencia.empleado_nombre}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTipoBadge(incidencia.tipo)}`}>
                                                {getTipoIcon(incidencia.tipo)}
                                                {incidencia.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                            {formatFecha(incidencia.fecha_inicio)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                            {formatFecha(incidencia.fecha_fin)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadge(incidencia.estado)}`}>
                                                {incidencia.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openDetailModal(incidencia)}
                                                    className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-300 dark:text-blue-400"
                                                    title="Ver detalles"
                                                >
                                                    <FiFileText className="w-4 h-4" />
                                                </button>
                                                {incidencia.estado === 'pendiente' && (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(incidencia)}
                                                            className="text-gray-600 hover:text-gray-900 dark:hover:text-white dark:text-gray-400"
                                                            title="Editar"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAprobar(incidencia.id)}
                                                            className="text-green-600 hover:text-green-900 dark:hover:text-green-300 dark:text-green-400"
                                                            title="Aprobar"
                                                        >
                                                            <FiCheck className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openRechazarModal(incidencia.id)}
                                                            className="text-red-600 hover:text-red-900 dark:hover:text-red-300 dark:text-red-400"
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