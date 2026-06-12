import { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

/**
 * Hook para gestionar tours interactivos por módulo.
 * @param {string} moduleId - Identificador único del módulo (ej: 'horarios')
 * @param {Array} steps - Pasos del tour siguiendo el formato de driver.js
 * @param {boolean} trigger - Condición adicional para disparar el tour
 */
export const useTour = (moduleId, steps, trigger = true) => {
    useEffect(() => {
        // Deshabilitado temporalmente a petición del usuario
        return;
    }, [moduleId, steps, trigger]);
};
