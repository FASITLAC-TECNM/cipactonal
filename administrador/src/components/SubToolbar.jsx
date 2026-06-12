import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * SubToolbar — Teletransporta filtros/controles secundarios al #sub-toolbar-portal
 * ubicado debajo del header principal en MainLayout.
 *
 * Uso: importar en la página y envolver los controles secundarios.
 * El contenedor en MainLayout sólo ocupa espacio cuando hay contenido.
 */
const SubToolbar = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const [portalNode, setPortalNode] = useState(null);

    useEffect(() => {
        let timeoutId;
        const checkNode = () => {
            const node = document.getElementById('sub-toolbar-portal');
            if (node) {
                setPortalNode(node);
                setMounted(true);
            } else {
                timeoutId = setTimeout(checkNode, 100);
            }
        };
        timeoutId = setTimeout(checkNode, 0);
        return () => clearTimeout(timeoutId);
    }, []);

    if (!mounted || !portalNode) return null;

    return createPortal(
        <div className="w-full flex items-center gap-2 flex-wrap animate-slide-in-top">
            {children}
        </div>,
        portalNode
    );
};

export default SubToolbar;
