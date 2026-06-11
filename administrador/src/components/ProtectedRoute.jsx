import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import DynamicLoader from './common/DynamicLoader';

/**
 * Componente para proteger rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige al login
 */
const ProtectedRoute = ({ children, requireAdmin = false, permission = null }) => {
    const { isAuthenticated, isAdmin, hasPermission, loading } = useAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <DynamicLoader text="Verificando sesión..." />
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar si el usuario cumple con los requerimientos de acceso
    const tieneAcceso = (!requireAdmin || isAdmin()) && (!permission || hasPermission(permission));

    if (!tieneAcceso) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="card max-w-md text-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-10 h-10 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Acceso Denegado
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        No tienes permisos para acceder a esta página.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="btn-primary"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    // Si está autenticado y tiene permisos, mostrar el contenido
    return children;
};

export default ProtectedRoute;