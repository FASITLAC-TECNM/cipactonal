import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiGlobe, FiActivity, FiShield, FiAlertTriangle, FiImage, FiUsers, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { API_CONFIG } from '../config/Apiconfig';
import DynamicLoader from '../components/common/DynamicLoader';

const ConfigurarEmpresaSaaS = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [empresa, setEmpresa] = useState({
        nombre: '',
        logo: '',
        es_activo: true,
        telefono: '',
        correo: '',
        limite_empleados: '',
        limite_dispositivos: '',
        fecha_vencimiento: '',
        total_usuarios: 0,
        total_departamentos: 0,
        configuracion_reportes: {
            modulos: {
                asistencia: true,
                horarios: true,
                avisos: true,
                dispositivos: true,
                reconocimiento_facial: false,
                geocercas: false,
                notificaciones_push: false,
                importacion_masiva: true
            }
        }
    });

    const API_URL = API_CONFIG.BASE_URL;

    useEffect(() => {
        fetchEmpresaDetails();
    }, [id]);

    const fetchEmpresaDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/empresas/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener detalles de la empresa');
            }

            if (data.success && data.data) {
                // Asegurar que configuracion_reportes tenga la estructura de modulos
                const configBase = data.data.configuracion_reportes || {};
                if (!configBase.modulos) {
                    configBase.modulos = {
                        asistencia: true,
                        horarios: true,
                        avisos: true,
                        dispositivos: true,
                        reconocimiento_facial: false,
                        geocercas: false,
                        notificaciones_push: false,
                        importacion_masiva: true
                    };
                }

                setEmpresa({
                    nombre: data.data.nombre || '',
                    logo: data.data.logo || '',
                    es_activo: data.data.es_activo ?? true,
                    telefono: data.data.telefono || '',
                    correo: data.data.correo || '',
                    limite_empleados: data.data.limite_empleados || '',
                    limite_dispositivos: data.data.limite_dispositivos || '',
                    fecha_vencimiento: data.data.fecha_vencimiento ? data.data.fecha_vencimiento.split('T')[0] : '',
                    total_usuarios: parseInt(data.data.total_usuarios) || 0,
                    total_departamentos: parseInt(data.data.total_departamentos) || 0,
                    configuracion_reportes: configBase
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEmpresa(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleModuleToggle = (modulo) => {
        setEmpresa(prev => ({
            ...prev,
            configuracion_reportes: {
                ...prev.configuracion_reportes,
                modulos: {
                    ...prev.configuracion_reportes.modulos,
                    [modulo]: !prev.configuracion_reportes.modulos[modulo]
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            setSuccessMsg('');

            const dataToSubmit = { ...empresa };
            if (dataToSubmit.limite_empleados === '') dataToSubmit.limite_empleados = null;
            if (dataToSubmit.limite_dispositivos === '') dataToSubmit.limite_dispositivos = null;
            if (dataToSubmit.fecha_vencimiento === '') dataToSubmit.fecha_vencimiento = null;

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/empresas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSubmit)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar la configuración');
            }

            setSuccessMsg('Configuración actualizada correctamente');

            // Ocultar mensaje despues de 3 seg
            setTimeout(() => setSuccessMsg(''), 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <DynamicLoader text="Obteniendo configuración del Tenant..." />;

    const consumoEmpleados = empresa.limite_empleados ? (empresa.total_usuarios / empresa.limite_empleados) * 100 : 0;
    const progresoEmpleados = Math.min(consumoEmpleados, 100);
    const colorProgreso = progresoEmpleados > 90 ? 'bg-red-500 shadow-sm' : progresoEmpleados > 75 ? 'bg-amber-500 shadow-sm' : 'bg-blue-600 shadow-sm';

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            {/* Cabecera / Navegacion */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/empresas')}
                        className="p-3 text-slate-600 hover:text-slate-900 dark:text-[#a0a09a] dark:hover:text-[#e8e8e4] bg-white/50 dark:bg-[#2a2a27]/50 border border-slate-200 dark:border-[#3a3a36] rounded-2xl transition-all shadow-sm group"
                    >
                        <FiArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#e8e8e4] tracking-tight">
                            Ajustes de Entidad
                        </h1>
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-mono mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                            {id}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border shadow-sm flex items-center gap-2
                        ${empresa.es_activo 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50' 
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'}`}>
                        <div className={`w-2 h-2 rounded-full ${empresa.es_activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {empresa.es_activo ? 'Instancia Operativa' : 'Instancia Suspendida'}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-fade-in-up">
                    <FiAlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {successMsg && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold rounded-xl border border-green-100 dark:border-green-900/30 flex items-center gap-3 animate-fade-in-up">
                    <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{successMsg}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Columna Izquierda: Identidad y Estadísticas */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Tarjeta de Identidad */}
                    <div className="card flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="w-28 h-28 bg-slate-50 dark:bg-[#2a2a27] rounded-3xl border border-slate-100 dark:border-[#3a3a36] flex items-center justify-center p-4 mb-6 relative z-10 shadow-inner overflow-hidden">
                            {empresa.logo ? (
                                <img src={empresa.logo} alt="Logo Prev" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110 duration-500" />
                            ) : (
                                <FiGlobe className="w-12 h-12 text-slate-300 dark:text-[#a0a09a]" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-[#e8e8e4] leading-tight break-words max-w-full relative z-10">
                            {empresa.nombre || 'Sin Nombre'}
                        </h2>
                        <p className="text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-widest mt-3 relative z-10 flex items-center justify-center gap-1.5">
                            <FiShield className="w-3 h-3" />
                            Entidad Registrada
                        </p>
                    </div>

                    {/* Tarjeta de Estadísticas de Consumo */}
                    <div className="card relative overflow-hidden">
                        <h3 className="font-bold text-slate-400 dark:text-[#a0a09a] text-xs uppercase tracking-wider flex items-center gap-2 mb-6">
                            <FiActivity className="text-primary-500 w-4 h-4" />
                            Métricas de Uso
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-500 dark:text-[#a0a09a] text-xs font-semibold">Usuarios</span>
                                    <span className="text-slate-900 dark:text-[#e8e8e4] font-mono text-lg font-bold">{empresa.total_usuarios}<span className="text-slate-400 dark:text-[#a0a09a] text-xs font-normal"> / {empresa.limite_empleados || '∞'}</span></span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-[#2a2a27] rounded-full h-2 border border-slate-200 dark:border-[#3a3a36] overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${colorProgreso}`} style={{ width: `${progresoEmpleados}%` }}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-[#2a2a27] p-4 rounded-xl border border-slate-100 dark:border-[#3a3a36] text-center transition-all hover:bg-white dark:hover:bg-[#363632]">
                                    <p className="text-slate-500 dark:text-[#a0a09a] text-[10px] font-bold uppercase tracking-wider mb-1">Dptos.</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-[#e8e8e4]">{empresa.total_departamentos}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-[#2a2a27] p-4 rounded-xl border border-slate-100 dark:border-[#3a3a36] text-center transition-all hover:bg-white dark:hover:bg-[#363632]">
                                    <p className="text-slate-500 dark:text-[#a0a09a] text-[10px] font-bold uppercase tracking-wider mb-1">Activos</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-[#e8e8e4]">{empresa.total_usuarios}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Control Maestro (Kill Switch) */}
                    <div className="card border border-red-200 dark:border-red-900/30">
                        <h3 className="font-bold text-slate-400 dark:text-[#a0a09a] text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                            <FiShield className="text-red-500 w-4 h-4" />
                            Estado de Servicio
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-[#a0a09a] mb-6 font-medium">
                            La suspensión bloquea el acceso total a la instancia.
                        </p>

                        <label className="flex items-center justify-between cursor-pointer bg-slate-50 dark:bg-[#2a2a27] p-3 rounded-xl border border-slate-100 dark:border-[#3a3a36] hover:border-red-200 dark:hover:border-red-900/50 transition-all">
                            <span className="font-bold text-xs text-slate-600 dark:text-[#e8e8e4] uppercase">
                                {empresa.es_activo ? 'Suspender' : 'Restaurar'}
                            </span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="es_activo"
                                    className="sr-only"
                                    checked={empresa.es_activo}
                                    onChange={handleChange}
                                />
                                <div className={`block w-12 h-6 rounded-full transition-all ${empresa.es_activo ? 'bg-green-100 border border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800'}`}></div>
                                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-300 ${empresa.es_activo ? 'bg-green-500 translate-x-6' : 'bg-red-500 translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Columna Derecha: Formulario y Configuraciones */}
                <div className="lg:col-span-3 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Datos Generales */}
                            <div className="card space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-[#e8e8e4] flex items-center gap-3 relative z-10">
                                    <FiGlobe className="text-primary-500 w-5 h-5" />
                                    Identidad
                                </h3>

                                <div className="space-y-5 relative z-10">
                                    <div className="space-y-1.5">
                                        <label className="label">Nombre Comercial / Razón Social <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            required
                                            value={empresa.nombre}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="Ej. Corporativo FASITLAC"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="label">Teléfono</label>
                                            <input
                                                type="tel"
                                                name="telefono"
                                                value={empresa.telefono}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="999 999 9999"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="label">E-mail</label>
                                            <input
                                                type="email"
                                                name="correo"
                                                value={empresa.correo}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="admin@empresa.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="label">URL Logotipo (Alta Definición)</label>
                                        <div className="relative">
                                            <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#a0a09a] w-4 h-4 pointer-events-none" />
                                            <input
                                                type="url"
                                                name="logo"
                                                value={empresa.logo}
                                                onChange={handleChange}
                                                className="input pl-10"
                                                placeholder="https://cdn.empresa.com/logo.png"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Configuración de Licencia */}
                            <div className="card space-y-6 relative overflow-hidden group">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-[#e8e8e4] flex items-center gap-3 relative z-10">
                                    <FiShield className="text-amber-500 dark:text-amber-400 w-5 h-5" />
                                    Suscripción SaaS
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                                    <div className="space-y-1.5">
                                        <label className="label">Límite Empleados</label>
                                        <input
                                            type="number"
                                            name="limite_empleados"
                                            min="1"
                                            value={empresa.limite_empleados}
                                            onChange={handleChange}
                                            className="input text-center text-lg font-mono"
                                            placeholder="∞"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="label">Límite Dispositivos</label>
                                        <input
                                            type="number"
                                            name="limite_dispositivos"
                                            min="1"
                                            value={empresa.limite_dispositivos}
                                            onChange={handleChange}
                                            className="input text-center text-lg font-mono"
                                            placeholder="∞"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 relative z-10">
                                    <label className="label">Fecha de Expiración</label>
                                    <input
                                        type="date"
                                        name="fecha_vencimiento"
                                        value={empresa.fecha_vencimiento}
                                        onChange={handleChange}
                                        className="input text-center"
                                    />
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 text-[11px] text-amber-700 dark:text-amber-400 font-bold uppercase text-center relative z-10">
                                    El sistema suspenderá la instancia automáticamente.
                                </div>
                            </div>
                        </div>

                        {/* Nueva Sección: Módulos Activos (Estética Bata Blanca) */}
                        <div className="card space-y-6 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-[#e8e8e4] flex items-center gap-3">
                                    <FiCheckCircle className="text-primary-500 w-5 h-5" />
                                    Módulos Disponibles
                                </h3>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-[#2a2a27] border border-slate-200 dark:border-[#3a3a36] text-slate-500 dark:text-[#a0a09a] text-[10px] font-bold uppercase rounded-full">
                                    Configuraciones de App
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                {Object.entries(empresa.configuracion_reportes?.modulos || {}).map(([key, val]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleModuleToggle(key)}
                                        className={`flex flex-col gap-3 p-4 rounded-xl border transition-all text-left group/mod
                                            ${val 
                                                ? 'bg-white dark:bg-[#1e1e1c] border-primary-500 shadow-sm' 
                                                : 'bg-slate-50 dark:bg-[#2a2a27]/50 border-slate-200 dark:border-[#3a3a36] opacity-70 grayscale hover:opacity-100 hover:grayscale-0 hover:border-slate-300 dark:hover:border-gray-500'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all
                                            ${val ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400' : 'bg-slate-100 dark:bg-[#2a2a27] border-slate-200 dark:border-[#3a3a36] text-slate-400 dark:text-[#a0a09a]'}`}>
                                            <FiActivity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${val ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-[#a0a09a]'}`}>
                                                {val ? 'Activo' : 'Inactivo'}
                                            </p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-[#e8e8e4] capitalize leading-tight">
                                                {key.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Botón de Acción Final */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary flex items-center gap-3 px-8 py-3 text-sm"
                            >
                                {saving ? <FiActivity className="animate-spin w-5 h-5" /> : <FiSave className="w-5 h-5" />}
                                <span>{saving ? 'Guardando...' : 'Actualizar Configuración'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfigurarEmpresaSaaS;
