import { createPortal } from 'react-dom';
import { FiAlertCircle, FiInfo } from 'react-icons/fi';

function ConfirmBox({ message, onConfirm, onCancel }) {
    const isConfirm = !!onCancel;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
            {/* Local animation styles for premium feel */}
            <style>{`
                @keyframes cb-fade-in {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to { opacity: 1; backdrop-filter: blur(8px); }
                }
                @keyframes cb-scale-up {
                    from { transform: scale(0.96) translateY(12px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .cb-backdrop-animate {
                    animation: cb-fade-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .cb-modal-animate {
                    animation: cb-scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/45 dark:bg-black/65 cb-backdrop-animate"
                onClick={onCancel || onConfirm}
            />

            {/* Modal Card */}
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[28px] border border-slate-200/50 dark:border-slate-800/80 max-w-sm w-full shadow-[0_24px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden cb-modal-animate">
                
                {/* Content Area */}
                <div className="p-6 md:p-7 flex flex-col items-center text-center">
                    
                    {/* Icon Container with subtle gradient and premium border */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-inner transition-transform duration-300 hover:scale-105 ${
                        isConfirm
                            ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-900/30'
                            : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30'
                    }`}>
                        {isConfirm
                            ? <FiAlertCircle className="w-6 h-6 animate-[pulse_2s_infinite]" />
                            : <FiInfo className="w-6 h-6" />
                        }
                    </div>

                    {/* Headline */}
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                        {isConfirm ? 'Confirmar Acción' : 'Aviso del Sistema'}
                    </h3>
                    
                    {/* Description Text */}
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-1">
                        {message}
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 pb-6 pt-2 flex gap-3">
                    {isConfirm ? (
                        <>
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98]"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-white transition-all duration-200 active:scale-[0.98] shadow-sm ${
                                    isConfirm 
                                        ? 'bg-red-600 hover:bg-red-500 hover:shadow-red-500/10 dark:bg-red-500 dark:hover:bg-red-400' 
                                        : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/10 dark:bg-blue-500 dark:hover:bg-blue-400'
                                }`}
                            >
                                Confirmar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onConfirm}
                            className="w-full py-3 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-sm"
                        >
                            Entendido
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmBox;
