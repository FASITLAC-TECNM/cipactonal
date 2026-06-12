import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * MobileActions — Portal para inyectar acciones rápidas en la barra inferior de móvil.
 * Solo se muestra en pantallas < lg (igual que el mobile bar).
 *
 * Uso: importar en la página y envolver botones/íconos de acción rápida.
 * <MobileActions>
 *     <button onClick={...}><FiSearch /></button>
 * </MobileActions>
 */
const MobileActions = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const [portalNode, setPortalNode] = useState(null);

    useEffect(() => {
        let timeoutId;
        const checkNode = () => {
            const node = document.getElementById('mobile-actions-portal');
            if (node) {
                setPortalNode(node);
                setMounted(true);
            } else {
                timeoutId = setTimeout(checkNode, 50);
            }
        };
        timeoutId = setTimeout(checkNode, 0);
        return () => clearTimeout(timeoutId);
    }, []);

    if (!mounted || !portalNode) return null;

    return createPortal(
        <div className="flex items-center gap-2">
            {children}
        </div>,
        portalNode
    );
};

export default MobileActions;
