import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Componente que teletransporta su contenido al #header-actions-portal en el MainLayout
 */
const HeaderActions = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const [portalNode, setPortalNode] = useState(null);

    useEffect(() => {
        let timeoutId;
        const checkNode = () => {
            const node = document.getElementById('header-actions-portal');
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
        <div className="w-full flex justify-end animate-slide-in-top">
            {children}
        </div>,
        portalNode
    );
};

export default HeaderActions;
