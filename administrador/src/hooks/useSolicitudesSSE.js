import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/Apiconfig';
const API_URL = API_CONFIG.BASE_URL;

/**
 * Hook para escuchar eventos SSE de solicitudes en tiempo real.
 * @param {Object} callbacks
 * @param {Function} callbacks.onNuevaSolicitud - Se ejecuta al recibir una nueva solicitud
 * @param {Function} callbacks.onSolicitudActualizada - Se ejecuta al aceptar/rechazar una solicitud
 */
export function useSolicitudesSSE({ onNuevaSolicitud, onSolicitudActualizada }) {
    const { user, hasPermission } = useAuth();
    const eventSourceRef = useRef(null);
    const callbacksRef = useRef({ onNuevaSolicitud, onSolicitudActualizada });

    // Actualizar refs para evitar clausuras obsoletas sin reconectar
    useEffect(() => {
        callbacksRef.current = { onNuevaSolicitud, onSolicitudActualizada };
    }, [onNuevaSolicitud, onSolicitudActualizada]);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const canViewDevices = user?.esPropietarioSaaS || hasPermission('DISPOSITIVO_VER') || hasPermission('DISPOSITIVO_CREAR') || hasPermission('DISPOSITIVO_GESTIONAR');
        if (!canViewDevices) return;

        const url = `${API_URL}/api/solicitudes/stream?token=${encodeURIComponent(token)}`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.addEventListener('nueva-solicitud', (e) => {
            try {
                const data = JSON.parse(e.data);
                callbacksRef.current.onNuevaSolicitud?.(data);
            } catch (err) {
                console.error('Error parsing SSE nueva-solicitud:', err);
            }
        });

        es.addEventListener('solicitud-actualizada', (e) => {
            try {
                const data = JSON.parse(e.data);
                callbacksRef.current.onSolicitudActualizada?.(data);
            } catch (err) {
                console.error('Error parsing SSE solicitud-actualizada:', err);
            }
        });

        es.onerror = () => {
            // console.warn('SSE conexión perdida, reconectando...');
        };

        return () => {
            es.close();
            eventSourceRef.current = null;
        };
    }, []);
}
