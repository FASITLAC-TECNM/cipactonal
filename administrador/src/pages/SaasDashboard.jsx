import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/Apiconfig';
import { FiHome, FiUsers, FiMonitor, FiActivity, FiGlobe, FiDatabase, FiCloud } from 'react-icons/fi';
import DynamicLoader from '../components/common/DynamicLoader';
import { useNavigate } from 'react-router-dom';

const API_URL = API_CONFIG.BASE_URL;

const SaasDashboard = () => {
    const [metricas, setMetricas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMetricas = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_URL}/api/saas/metricas`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();

                if (data.success) {
                    setMetricas(data.data);
                } else {
                    setError('Error al obtener métricas: ' + data.message);
                }
            } catch (err) {
                console.error(err);
                setError('Error de conexión con el servidor central');
            } finally {
                setLoading(false);
            }
        };

        fetchMetricas();
    }, []);

    if (loading) return <DynamicLoader text="Obteniendo métricas globales..." />;
    if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>;

    const stats = [
        {
            title: 'Empresas Registradas',
            value: metricas?.empresas?.total || 0,
            color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
            icon: FiGlobe,
            details: `${metricas?.empresas?.activas || 0} activas, ${metricas?.empresas?.inactivas || 0} suspendidas`,
            delay: '100ms'
        },
        {
            title: 'Trabajadores Globales',
            value: metricas?.empleados || 0,
            color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50',
            icon: FiUsers,
            details: 'En todos los tenants',
            delay: '200ms'
        },
        {
            title: 'Dispositivos Conectados',
            value: metricas?.dispositivos || 0,
            color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
            icon: FiMonitor,
            details: 'Móviles y Escritorio',
            delay: '300ms'
        },
        {
            title: 'Usuarios del Sistema',
            value: metricas?.usuarios || 0,
            color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
            icon: FiActivity,
            details: 'Administradores y Empleados',
            delay: '400ms'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Panel de Control SaaS</h2>
                    <p className="text-slate-500 dark:text-[#a0a09a] mt-1">Visión global de todo el ecosistema multi-tenant.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/saas-logs')}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <FiActivity className="w-4 h-4" /> System Logs
                    </button>
                    <button
                        onClick={() => navigate('/empresas')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <FiGlobe className="w-4 h-4" /> Gestionar Entidades
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="card flex flex-col items-start relative overflow-hidden group hover:-translate-y-1 hover:border-slate-300 dark:hover:border-[#3a3a36] animate-fade-in-up" style={{ animationDelay: stat.delay }}>
                            <div className={`p-3 rounded-xl mb-4 border ${stat.color} transition-colors`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <h3 className="text-slate-500 dark:text-[#a0a09a] text-[11px] font-bold tracking-wider uppercase mb-1">{stat.title}</h3>
                            <div className="flex items-end gap-3 mb-4">
                                <p className="text-4xl font-black text-slate-800 dark:text-[#e8e8e4] leading-none tracking-tight group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                            </div>

                            <div className="mt-auto w-full pt-4 border-t border-slate-100/50 dark:border-[#2a2a27]/50">
                                <p className="text-xs text-slate-500 dark:text-[#a0a09a] font-medium truncate">
                                    {stat.details}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Espacio para futuras graficas SaaS */}
            <div className="card min-h-[300px] flex items-center justify-center relative group overflow-hidden animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                {/* Background Decorativo */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="text-slate-400 dark:text-[#a0a09a] flex flex-col items-center gap-4 relative z-10">
                    <div className="relative">
                        <FiCloud className="w-12 h-12 opacity-30 text-primary-600 dark:text-primary-400" />
                        <FiDatabase className="w-6 h-6 absolute bottom-0 right-0 opacity-50 animate-bounce text-blue-500" />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-sm text-slate-600 dark:text-[#e8e8e4]">Métricas Avanzadas del Clúster</p>
                        <p className="text-xs text-slate-500 dark:text-[#a0a09a] mt-1">Próximamente: Rendimiento, Uso de Almacenamiento y Queries</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaasDashboard;
