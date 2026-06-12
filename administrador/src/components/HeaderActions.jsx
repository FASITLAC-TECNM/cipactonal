import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

const MobileToolsDropdown = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative sm:hidden ml-auto">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-[#2a2a27]/80 backdrop-blur-sm border border-slate-200 dark:border-[#363632] rounded-lg text-slate-600 dark:text-[#e8e8e4] hover:bg-slate-50 dark:hover:bg-[#363632] transition-colors shadow-sm"
            >
                <MoreVertical className="w-4 h-4" />
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
                    <div 
                        className="fixed top-14 right-4 p-3 bg-white dark:bg-[#1e1e1c] rounded-xl shadow-2xl border border-slate-200/60 dark:border-[#2a2a27] z-[110] flex flex-col gap-3 min-w-[200px] animate-fade-in-up 
                        [&>div]:!flex-col [&>div]:!items-stretch [&>div]:!w-full [&>div]:!gap-2 [&_button]:!w-full [&_button]:!justify-start [&_a]:!w-full [&_a]:!justify-start"
                        onClick={(e) => {
                            // Close dropdown if a button is clicked (unless it's just a view toggle container click)
                            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                                setIsOpen(false);
                            }
                        }}
                    >
                        {children}
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * Componente que teletransporta su contenido al #header-actions-portal en el MainLayout
 */
const HeaderActions = ({ children, disableDropdown = false }) => {
    const [mounted, setMounted] = useState(false);
    const [portalNode, setPortalNode] = useState(null);
    const desktopRef = useRef(null);
    const [useDropdown, setUseDropdown] = useState(false);

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

    // Check how many interactive elements there are to decide if we need a dropdown on mobile
    useEffect(() => {
        if (disableDropdown) {
            setUseDropdown(false);
            return;
        }
        if (desktopRef.current) {
            // Wait a tick to ensure children are rendered in the DOM
            setTimeout(() => {
                if (desktopRef.current) {
                    const interactables = desktopRef.current.querySelectorAll('button, select, input, a[href]');
                    setUseDropdown(interactables.length > 1);
                }
            }, 0);
        }
    }, [children, mounted, disableDropdown]);

    if (!mounted || !portalNode) return null;

    return createPortal(
        <>
            <div className="hidden sm:flex flex-1 justify-end items-center gap-2 sm:gap-3 min-w-0 overflow-hidden animate-slide-in-top" ref={desktopRef}>
                {children}
            </div>
            {useDropdown ? (
                <MobileToolsDropdown>
                    {children}
                </MobileToolsDropdown>
            ) : (
                <div className="sm:hidden flex flex-1 justify-end items-center gap-2 min-w-0 animate-slide-in-top">
                    {children}
                </div>
            )}
        </>,
        portalNode
    );
};

export default HeaderActions;
