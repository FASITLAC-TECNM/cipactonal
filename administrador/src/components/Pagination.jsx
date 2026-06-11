/**
 * Componente de paginación reutilizable.
 * Muestra máximo 5 botones de página con ellipsis (...) cuando hay muchas páginas.
 */
function Pagination({ pagina, totalPaginas, total, porPagina, onChange }) {
    // if (totalPaginas <= 1) return null; // Eliminado para siempre mostrar los controles

    const inicio = (pagina - 1) * porPagina + 1;
    const fin = Math.min(pagina * porPagina, total);

    // Calcular qué páginas mostrar (máx 5 con ellipsis)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPaginas <= maxVisible) {
            for (let i = 1; i <= totalPaginas; i++) pages.push(i);
        } else {
            pages.push(1);

            let start = Math.max(2, pagina - 1);
            let end = Math.min(totalPaginas - 1, pagina + 1);

            if (pagina <= 3) {
                end = 4;
            } else if (pagina >= totalPaginas - 2) {
                start = totalPaginas - 3;
            }

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPaginas - 1) pages.push('...');

            pages.push(totalPaginas);
        }

        return pages;
    };

    return (
        <div className="fixed bottom-4 right-6 lg:right-10 z-40 pointer-events-none flex justify-end">
            <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-2 border border-slate-200/60 dark:border-[#3a3a36]/60 bg-white/80 dark:bg-[#1e1e1c]/80 backdrop-blur-xl rounded-full shadow-lg shadow-slate-200/20 dark:shadow-black/20 w-max transition-all">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-[#a0a09a] whitespace-nowrap hidden sm:block leading-none m-0">
                    {inicio}-{fin} de {total}
                </p>
                <div className="flex items-center gap-1 sm:border-l border-slate-200 dark:border-[#3a3a36] sm:pl-4 h-8">
                    <button
                        onClick={() => onChange(Math.max(1, pagina - 1))}
                        disabled={pagina === 1}
                        className="h-6 sm:h-8 px-2 sm:px-3 flex items-center justify-center text-[10px] sm:text-xs font-bold rounded-full hover:bg-slate-100 dark:hover:bg-[#2a2a27] text-slate-600 dark:text-[#a0a09a] hover:text-slate-900 dark:hover:text-[#e8e8e4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors leading-none"
                    >
                        Anterior
                    </button>

                    {getPageNumbers().map((num, i) =>
                        num === '...' ? (
                            <span key={`ellipsis-${i}`} className="px-1 sm:px-2 flex items-center justify-center text-xs text-slate-400 dark:text-[#a0a09a] h-6 sm:h-8 leading-none">...</span>
                        ) : (
                            <button
                                key={num}
                                onClick={() => onChange(num)}
                                className={`w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-black rounded-full transition-all leading-none ${pagina === num
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                        : 'hover:bg-slate-100 dark:hover:bg-[#2a2a27] text-slate-600 dark:text-[#a0a09a] hover:text-slate-900 dark:hover:text-[#e8e8e4]'
                                    }`}
                            >
                                {num}
                            </button>
                        )
                    )}

                    <button
                        onClick={() => onChange(Math.min(totalPaginas, pagina + 1))}
                        disabled={pagina === totalPaginas}
                        className="h-6 sm:h-8 px-2 sm:px-3 flex items-center justify-center text-[10px] sm:text-xs font-bold rounded-full hover:bg-slate-100 dark:hover:bg-[#2a2a27] text-slate-600 dark:text-[#a0a09a] hover:text-slate-900 dark:hover:text-[#e8e8e4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors leading-none"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Pagination;
