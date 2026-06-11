/**
 * Mapeo de Códigos de Permiso a Posiciones de Bit
 * Debe coincidir exactamente con el backend (src/utils/permissions.js)
 */
export const PERMISOS = {
    // USUARIOS Y EMPLEADOS (0-3)
    USUARIO_VER: 0,
    USUARIO_CREAR: 1,
    USUARIO_EDITAR: 2,
    USUARIO_ELIMINAR: 3, // Desactivar usuarios y empleados

    // ROLES (4-8)
    ROL_VER: 4,
    ROL_CREAR: 5,
    ROL_EDITAR: 6,
    ROL_ELIMINAR: 7,
    ROL_ASIGNAR: 8,

    // HORARIOS E INCIDENCIAS (9-14)
    HORARIO_VER: 9,
    HORARIO_CREAR: 10,
    HORARIO_EDITAR: 11,
    HORARIO_ELIMINAR: 12,
    HORARIO_ASIGNAR: 13,
    HORARIO_GESTIONAR: 14,

    // DEPARTAMENTOS (15-19)
    DEPARTAMENTO_VER: 15,
    DEPARTAMENTO_CREAR: 16,
    DEPARTAMENTO_EDITAR: 17,
    DEPARTAMENTO_ELIMINAR: 18,
    DEPARTAMENTO_ASIGNAR: 19,

    // DISPOSITIVOS (20-24)
    DISPOSITIVO_VER: 20,
    DISPOSITIVO_CREAR: 21,
    DISPOSITIVO_EDITAR: 22,
    DISPOSITIVO_ELIMINAR: 23,
    DISPOSITIVO_GESTIONAR: 24,

    // AVISOS (25-28)
    AVISO_VER: 25,
    AVISO_CREAR: 26,
    AVISO_EDITAR: 27,
    AVISO_ELIMINAR: 28,

    // REPORTES (29-30)
    REPORTE_VER: 29,
    REPORTE_EXPORTAR: 30,

    // REGISTROS (31)
    REGISTRO_VER: 31,

    // CONFIGURACIÓN (32-38)
    CONFIG_VER: 32,
    CONFIG_GENERAL: 33,
    CONFIG_EMPRESA: 34,
    CONFIG_SEGURIDAD: 35,
    CONFIG_ASISTENCIA: 36,
    CONFIG_RED: 37,
    CONFIG_REPORTES: 38
};

/**
 * Verifica si un valor de permisos bitwise tiene un permiso específico por código
 * @param {string|number|bigint} permisosBitwise - Valor de permisos del usuario (BigInt string o número)
 * @param {string} codigoPermiso - Código del permiso (ej: 'USUARIO_VER')
 * @returns {boolean}
 */
export function tienePermisoPorCodigo(permisosBitwise, codigoPermiso) {
    const bitPosition = PERMISOS[codigoPermiso];
    if (bitPosition === undefined) {
        console.warn(`Permiso desconocido en frontend: ${codigoPermiso}`);
        return false;
    }
    try {
        const permisos = BigInt(permisosBitwise || 0);
        const mask = BigInt(1) << BigInt(bitPosition);
        return (permisos & mask) !== BigInt(0);
    } catch (error) {
        console.error('Error al verificar permiso:', error);
        return false;
    }
}
