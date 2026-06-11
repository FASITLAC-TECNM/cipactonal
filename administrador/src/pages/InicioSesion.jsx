import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DynamicLoader from '../components/common/DynamicLoader';
import {
    FiUser,
    FiLock,
    FiEye,
    FiEyeOff,
    FiAlertCircle,
    FiArrowRight,
    FiChevronLeft,
    FiBriefcase,
    FiMail,
    FiCheckCircle
} from 'react-icons/fi';
import axios from 'axios';


/**
 * Componente de Login rediseñado estilo App Móvil
 */
const Login = () => {
    const { login, loading, error: authError } = useAuth();
    const [formData, setFormData] = useState({
        usuario: '',
        contraseña: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [empresas, setEmpresas] = useState(null); // lista de empresas si multi-tenant
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

    // Estado para recuperación de contraseña
    const [isRecovering, setIsRecovering] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryMessage, setRecoveryMessage] = useState('');
    const [recoverySuccess, setRecoverySuccess] = useState(false);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Limpiar error al escribir
        if (error) setError('');
    };

    const [isSuccess, setIsSuccess] = useState(false);

    // Re-enviar login con empresa_id seleccionado (multi-tenant)
    const handleSubmitWithEmpresa = async (empresaId) => {
        setIsSubmitting(true);
        setError('');
        try {
            const result = await login(formData.usuario, formData.contraseña, true, empresaId);
            if (!result.success) {
                setError(result.message || 'Error al iniciar sesión');
                setIsSubmitting(false);
            } else {
                setIsSuccess(true);
                setTimeout(() => {
                    if (result.confirmLogin) result.confirmLogin();
                }, 600);
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
            setIsSubmitting(false);
        }
    };

    // Manejar submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.usuario.trim()) {
            setError('El usuario o correo es requerido');
            return;
        }

        if (!formData.contraseña) {
            setError('La contraseña es requerida');
            return;
        }

        if (formData.contraseña.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const empresaId = empresaSeleccionada || null;
            const result = await login(formData.usuario, formData.contraseña, true, empresaId);

            // Multi-tenant: mostrar selector de empresas
            if (result.multiTenant) {
                setEmpresas(result.empresas);
                setIsSubmitting(false);
                return;
            }

            if (!result.success) {
                setError(result.message || 'Error al iniciar sesión');
                setIsSubmitting(false);
            } else {
                setIsSuccess(true);
                setTimeout(() => {
                    if (result.confirmLogin) {
                        result.confirmLogin();
                    }
                }, 600);
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
            setIsSubmitting(false);
        }
    };

    const handleRecoverySubmit = async (e) => {
        e.preventDefault();
        if (!recoveryEmail.trim()) {
            setError('El correo es requerido');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setRecoveryMessage('');
        setRecoverySuccess(false);

        try {
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
            const response = await axios.post(`${baseURL}/api/auth/recuperar-password`, { correo: recoveryEmail });

            setRecoverySuccess(true);
            setRecoveryMessage(response.data.message || 'Instrucciones enviadas al correo.');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al solicitar recuperación');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#111110] overflow-hidden relative font-sans flex items-center justify-center transition-colors duration-300">
            {/* Fondo gradiente sutil y moderno */}
            <div className="-z-10 absolute inset-0 bg-gradient-to-br from-amber-50/20 via-white to-orange-50/15 dark:from-[#111110] dark:via-[#111110] dark:to-[#111110] pointer-events-none" />

            {/* Overlay de Éxito Profesional */}
            <div className={`fixed inset-0 z-[9999] bg-white/80 dark:bg-[#111110]/80 backdrop-blur-md transition-all duration-500 ease-in-out flex items-center justify-center pointer-events-none ${isSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}>
                <div className="flex flex-col items-center">
                    <DynamicLoader text="Accediendo..." size="large" />
                </div>
            </div>

            {/* Contenedor del Contenido */}
            <div
                className={`flex flex-col items-center justify-center w-full max-w-md transition-all duration-500 ease-out transform ${isSuccess ? 'scale-95 opacity-0 blur-sm' : 'scale-100 opacity-100 blur-0'
                    } animate-fade-in-up`}
            >
                {/* Sección de Logo y Marca */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">FASITLAC™</h1>
                    <p className="text-slate-500 dark:text-[#a0a09a] text-sm mt-2 font-medium tracking-wide">Fábrica de Software del ITLAC</p>
                </div>

                {/* Card del Formulario */}
                <div className="w-full card shadow-panel dark:shadow-panel-dark overflow-hidden relative z-10 p-0 border border-slate-200/60 dark:border-[#2a2a27]">
                    <div className="p-8">

                        {/* ─── SELECTOR DE EMPRESA (multi-tenant) ─── */}
                        {empresas ? (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <button
                                    type="button"
                                    onClick={() => { setEmpresas(null); setEmpresaSeleccionada(null); setError(''); }}
                                    className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                                >
                                    <FiChevronLeft className="w-4 h-4" /> Volver
                                </button>

                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-[#e8e8e4]">Selecciona tu empresa</h2>
                                    <p className="text-sm text-slate-500 dark:text-[#a0a09a] mt-2">Tu cuenta está registrada en varias empresas</p>
                                </div>

                                <div className="space-y-3">
                                    {empresas.map((emp) => (
                                        <button
                                            key={emp.empresa_id}
                                            type="button"
                                            onClick={() => {
                                                setEmpresaSeleccionada(emp.empresa_id);
                                                setEmpresas(null);
                                                setTimeout(() => {
                                                    const fakeEvent = { preventDefault: () => { } };
                                                    handleSubmitWithEmpresa(emp.empresa_id);
                                                }, 50);
                                            }}
                                            className="w-full p-4 bg-slate-50 dark:bg-[#2a2a27]/50 hover:bg-blue-50 dark:hover:bg-primary-900/20 border-2 border-slate-200 dark:border-[#3a3a36] hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl transition-all duration-200 flex items-center gap-4 group"
                                        >
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 group-hover:bg-primary-100 dark:group-hover:bg-primary-800/40 rounded-xl flex items-center justify-center transition-colors shrink-0">
                                                <FiBriefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 dark:text-[#e8e8e4] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">{emp.nombre}</p>
                                                <p className="text-xs text-slate-400 dark:text-[#706f69] mt-0.5">Clic para ingresar</p>
                                            </div>
                                            <FiArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : isRecovering ? (
                            /* ─── FORMULARIO DE RECUPERACIÓN DE CONTRASEÑA ─── */
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <button
                                    type="button"
                                    onClick={() => { setIsRecovering(false); setError(''); setRecoveryMessage(''); }}
                                    className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                                >
                                    <FiChevronLeft className="w-4 h-4" /> Volver al inicio de sesión
                                </button>

                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-[#e8e8e4]">Recuperar Acceso</h2>
                                    <p className="text-sm text-slate-500 dark:text-[#a0a09a] mt-2">Ingresa tu correo para recibir las instrucciones</p>
                                </div>

                                {(error) && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
                                        <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                                    </div>
                                )}

                                {recoverySuccess ? (
                                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl flex items-start gap-3 text-left animate-in fade-in zoom-in-95">
                                        <FiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-green-800 dark:text-green-400 font-bold mb-1">Solicitud Recibida</p>
                                            <p className="text-sm text-green-700 dark:text-green-300">{recoveryMessage}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRecoverySubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                                Correo Electrónico
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                    <FiMail className="w-5 h-5 text-slate-400 focus-within:text-primary-600" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={recoveryEmail}
                                                    onChange={(e) => { setRecoveryEmail(e.target.value); setError(''); }}
                                                    className="input pl-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                                                    placeholder="ejemplo@correo.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                                        >
                                            {isSubmitting ? (
                                                <DynamicLoader text="Enviando..." size="tiny" />
                                            ) : (
                                                <>
                                                    <span>Enviar Instrucciones</span>
                                                    <FiArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        ) : (
                            /* ─── FORMULARIO DE LOGIN NORMAL ─── */
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#e8e8e4] mb-6 text-center">
                                    Iniciar Sesión
                                </h2>

                                {/* Mensaje de error */}
                                {(error || authError) && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                        <FiAlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                            {error || authError}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Usuario */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                            Usuario o Correo
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                <FiUser className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                name="usuario"
                                                value={formData.usuario}
                                                onChange={handleChange}
                                                className="input pl-12 bg-white/50 dark:bg-[#2a2a27]/50 backdrop-blur-sm"
                                                placeholder="usuario o correo"
                                                autoComplete="username"
                                            />
                                        </div>
                                    </div>

                                    {/* Contraseña */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                            Contraseña
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                <FiLock className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="contraseña"
                                                value={formData.contraseña}
                                                onChange={handleChange}
                                                className="input pl-12 pr-12 bg-white/50 dark:bg-[#2a2a27]/50 backdrop-blur-sm"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-[#a0a09a] transition-colors z-10"
                                            >
                                                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Olvidaste contraseña */}
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="button"
                                            onClick={() => { setIsRecovering(true); setError(''); }}
                                            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>

                                    {/* Botón Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || loading}
                                        className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                                    >
                                        {isSubmitting || loading ? (
                                            <DynamicLoader text="Iniciando..." size="tiny" />
                                        ) : (
                                            <>
                                                <span className="text-sm font-bold tracking-wide">Iniciar Sesión</span>
                                                <FiArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    {/* Footer en Card */}
                                    <div className="pt-4 text-center border-t border-slate-100 dark:border-[#2a2a27]/50 mt-6">
                                        <p className="text-sm text-slate-500 dark:text-[#a0a09a] pt-2">
                                            ¿No tienes cuenta?{' '}
                                            <a href="#" className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-colors">
                                                Contacta al admin
                                            </a>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Copyright Footer */}
                <div className="mt-8 text-center text-slate-400 dark:text-[#706f69] text-xs font-semibold tracking-widest">
                    © 2026 FASITLAC™
                </div>
            </div>
        </div>
    );
};

export default Login;