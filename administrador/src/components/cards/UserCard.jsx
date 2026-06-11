import React from 'react';
import { FiEdit2, FiMail, FiPhone, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const UserCard = ({ usuario, onEdit, onViewProfile, onDelete, onReactivar }) => {
    const { hasPermission } = useAuth();
    const canEdit = hasPermission('USUARIO_EDITAR');
    const canDelete = hasPermission('USUARIO_ELIMINAR');

    const getInitials = (nombre) => {
        if (!nombre) return '?';
        const parts = nombre.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    return (
        <div
            onClick={() => onViewProfile(usuario.usuario)}
            className={`group card p-0 hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer h-full ${usuario.estado_cuenta === 'baja'
                ? 'bg-slate-50 dark:bg-[#1e1e1c]/50 grayscale-[50%] opacity-75'
                : usuario.estado_cuenta === 'suspendido'
                    ? 'bg-orange-50/50 dark:bg-yellow-900/10'
                    : 'bg-white dark:bg-[#1e1e1c]'
                }`}
        >
            {/* Body */}
            <div className="p-4 flex-1 flex flex-col">
                {/* Header: Avatar e Info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {usuario.foto ? (
                                <img
                                    src={usuario.foto}
                                    alt={usuario.nombre}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-[#2a2a27] shadow-sm"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm shadow-sm opacity-90">
                                    {getInitials(usuario.nombre)}
                                </div>
                            )}
                        </div>

                        {/* Información Principal */}
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-[#e8e8e4] truncate" title={usuario.nombre}>
                                {usuario.nombre}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-[#a0a09a] truncate">@{usuario.usuario}</p>
                        </div>
                    </div>

                    {/* Badge de Estado */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${usuario.estado_cuenta === 'activo' ? 'bg-green-50 border border-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        usuario.estado_cuenta === 'suspendido' ? 'bg-orange-50 border border-orange-200 dark:bg-yellow-900/30 text-orange-700 dark:text-yellow-300' :
                            'bg-red-50 border border-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                        {usuario.estado_cuenta}
                    </span>
                </div>

                {/* Contacto y Roles */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-[#a0a09a]">
                        <div className="flex items-center gap-2 truncate" title={usuario.correo}>
                            <FiMail className="w-3.5 h-3.5 text-gray-400 dark:text-[#a0a09a] flex-shrink-0" />
                            <span className="truncate">{usuario.correo}</span>
                        </div>
                        {usuario.telefono && (
                            <div className="flex items-center gap-2 truncate text-[11px]">
                                <FiPhone className="w-3.5 h-3.5 text-gray-400 dark:text-[#a0a09a] flex-shrink-0" />
                                <span>{usuario.telefono}</span>
                            </div>
                        )}
                    </div>

                    {usuario.es_empleado && (
                        <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-[#2a2a27] text-slate-700 dark:text-[#e8e8e4] border border-slate-200 dark:border-[#2a2a27]">
                                Empleado
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer de Acciones (iguala al de Horarios) */}
            {(canEdit || canDelete) && (
                <div className="px-4 py-3 bg-slate-50 dark:bg-[#171715] border-t border-slate-100 dark:border-[#2a2a27] mt-auto">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {usuario.estado_cuenta !== 'baja' ? (
                            <>
                                {canEdit && (
                                    <button
                                        onClick={() => onEdit(usuario)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#e8e8e4] bg-white dark:bg-[#1e1e1c] border border-slate-300 dark:border-[#2a2a27] rounded-md hover:bg-slate-50 dark:hover:bg-[#2a2a27] transition-colors shadow-sm"
                                    >
                                        <FiEdit2 className="w-3.5 h-3.5" />
                                        Editar
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => onDelete(usuario)}
                                        className="flex items-center justify-center px-3 py-2 text-xs text-red-600 dark:text-red-400 bg-white dark:bg-[#1e1e1c] border border-slate-300 dark:border-[#2a2a27] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shadow-sm"
                                        title="Dar de baja"
                                    >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </>
                        ) : (
                            canDelete && (
                                <button
                                    onClick={() => onReactivar(usuario)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-green-300 bg-white dark:bg-[#1e1e1c] border border-slate-300 dark:border-green-800 rounded-md hover:bg-slate-50 dark:hover:bg-green-900/20 transition-colors shadow-sm"
                                >
                                    <FiRefreshCw className="w-3.5 h-3.5" />
                                    Reactivar
                                </button>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserCard;