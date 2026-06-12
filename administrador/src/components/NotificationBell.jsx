import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Check, Clock, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

const NotificationBell = ({ isSidebar = false, mobileMenuMode = false, onCloseMenu }) => {
    const { notifications, unreadCount } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { formatDate } = useConfig();

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = (notification) => {
        setIsOpen(false);
        if (onCloseMenu) onCloseMenu();
        // Navegar a dispositivos con parámetros para abrir el modal
        navigate(`/dispositivos?solicitudId=${notification.id}&tipo=${notification.tipo}`);
    };

    return (
        <div className={mobileMenuMode ? "w-full" : "relative"} ref={dropdownRef}>
            {mobileMenuMode ? (
                <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-[#e8e8e4] hover:bg-slate-50 dark:hover:bg-[#2a2a27]/80 flex items-center justify-between transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                            <Bell className="w-4 h-4" />
                        </div>
                        Notificaciones
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a2a27] rounded-lg transition-colors focus:outline-none"
                    title="Notificaciones"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#171715] animate-pulse"></span>
                    )}
                </button>
            )}

            {isOpen && (
                mobileMenuMode ? createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
                        <div className="relative w-full max-w-sm bg-white dark:bg-[#1e1e1c] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2a2a27] overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-up">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a27] flex items-center justify-between bg-gray-50/50 dark:bg-[#171715]/50 shrink-0">
                                <h3 className="font-semibold text-gray-900 dark:text-[#e8e8e4] text-sm">Notificaciones</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                                            {unreadCount} nuevas
                                        </span>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 rounded-md text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-[#a0a09a]">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm">No tienes notificaciones pendientes</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-[#2a2a27]">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-[#2a2a27]/50 cursor-pointer transition-colors group relative"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${notification.tipo === 'movil' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                                {notification.tipo === 'movil' ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-[#e8e8e4] truncate">
                                                    Solicitud de acceso
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-[#a0a09a] mt-0.5 truncate">
                                                    {notification.nombre} ({notification.correo})
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(notification.fecha_registro)}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="capitalize">{notification.tipo}</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        </div>
                    </div>
                </div>,
                document.body
                ) : (
                    <div className={`absolute ${isSidebar ? 'left-full ml-2 bottom-0 mb-0 origin-bottom-left' : 'right-0 mt-2 origin-top-right'} w-80 md:w-96 bg-white dark:bg-[#1e1e1c] rounded-xl shadow-lg border border-gray-200 dark:border-[#2a2a27] z-50 overflow-hidden transform transition-all`}>
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a27] flex items-center justify-between bg-gray-50/50 dark:bg-[#171715]/50">
                            <h3 className="font-semibold text-gray-900 dark:text-[#e8e8e4] text-sm">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                                    {unreadCount} nuevas
                                </span>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-[#a0a09a]">
                                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm">No tienes notificaciones pendientes</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-[#2a2a27]">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className="p-4 hover:bg-gray-50 dark:hover:bg-[#2a2a27]/50 cursor-pointer transition-colors group relative"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${notification.tipo === 'movil' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                                    {notification.tipo === 'movil' ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-[#e8e8e4] truncate">
                                                        Solicitud de acceso
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-[#a0a09a] mt-0.5 truncate">
                                                        {notification.nombre} ({notification.correo})
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(notification.fecha_registro)}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="capitalize">{notification.tipo}</span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default NotificationBell;
