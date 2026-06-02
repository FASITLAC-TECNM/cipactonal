import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DynamicLoader from '../components/common/DynamicLoader';
import { FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        nueva_contraseña: '',
        confirmar_contraseña: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Enlace inválido. No se proporcionó un token de recuperación.');
        }
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.nueva_contraseña.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formData.nueva_contraseña !== formData.confirmar_contraseña) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
            const response = await axios.post(`${baseURL}/api/auth/reset-password`, {
                token,
                nueva_contraseña: formData.nueva_contraseña
            });

            setSuccessMessage(response.data.message || 'Contraseña actualizada correctamente');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 overflow-hidden relative font-sans flex items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full max-w-md">
                
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-wide">FASITLAC™</h1>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mt-2 font-medium">Restablecer Contraseña</p>
                </div>

                <div className="w-full card overflow-hidden relative z-10 p-0">
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {successMessage ? (
                            <div className="text-center">
                                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-left">
                                    <FiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-green-800 font-bold mb-1">¡Éxito!</p>
                                        <p className="text-sm text-green-700">{successMessage}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-primary-600 font-bold hover:underline"
                                >
                                    Ir al Login
                                </button>
                            </div>
                        ) : token ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600 ml-1">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiLock className="w-5 h-5 text-slate-400 focus-within:text-primary-600" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="nueva_contraseña"
                                            value={formData.nueva_contraseña}
                                            onChange={handleChange}
                                            className="input pl-12 pr-12"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600 ml-1">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiLock className="w-5 h-5 text-slate-400 focus-within:text-primary-600" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmar_contraseña"
                                            value={formData.confirmar_contraseña}
                                            onChange={handleChange}
                                            className="input pl-12"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <DynamicLoader text="Guardando..." size="tiny" />
                                    ) : (
                                        <>
                                            <span>Restablecer Contraseña</span>
                                            <FiArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn-secondary py-2 px-4"
                                >
                                    Volver al Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-400 text-xs font-semibold">
                    © 2026 FASITLAC™
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
