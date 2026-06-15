export function srvBuscarBloqueActual(turnosDelDia, horaMinutos, intervaloBloquesMinutos, anticipoEntradaMax, posteriorSalidaMax = 60) {
    if (!turnosDelDia || turnosDelDia.length === 0) return null;
    // 1. Convertir turnos a formato de minutos absolutos y ordenar por hora de entrada const rangos = turnosDelDia.map(t => { const [he, me] = (t.inicio || t.entrada || "00:00").split(':').map(Number); const [hs, ms] = (t.fin || t.salida || "00:00").split(':').map(Number); return { entrada: he * 60 + me, salida: hs * 60 + ms }; }).sort((a, b) => a.entrada - b.entrada);
    // 2. Fusionar rangos en Bloques Lógicos const bloques = []; let bActual = { ...rangos[0] };
    for (let i = 1; i < rangos.length; i++) { const rSiguiente = rangos[i]; const separacion = rSiguiente.entrada - bActual.salida; if (separacion <= intervaloBloquesMinutos) { bActual.salida = Math.max(bActual.salida, rSiguiente.salida); } else { bloques.push({ ...bActual }); bActual = { ...rSiguiente }; } } bloques.push(bActual);
    // 3. Evaluar ventana operativa de cada bloque for (let i = 0; i < bloques.length; i++) { const b = bloques[i]; let inicioBusqueda = b.entrada - (anticipoEntradaMax || 0); let finBusqueda = b.salida + (posteriorSalidaMax || 60);
    if (i > 0) { const bPrev = bloques[i - 1]; const mid = bPrev.salida + (b.entrada - bPrev.salida) / 2; inicioBusqueda = Math.max(inicioBusqueda, mid); } if (i < bloques.length - 1) { const bNext = bloques[i + 1]; const mid = b.salida + (bNext.entrada - b.salida) / 2; finBusqueda = Math.min(finBusqueda, mid); }
    if (horaMinutos >= inicioBusqueda && Math.floor(horaMinutos) <= Math.floor(finBusqueda)) { return b; }
} return null; }
