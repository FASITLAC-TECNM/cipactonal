import { Router } from 'express';
import {
    getEstadisticasGlobales,
    getEstadisticasEmpleado,
    getEstadisticasDepartamento,
    getDetalleAsistencias,
    getDetalleIncidencias,
    getReporteDesempeno,
    getComparativaDepartamentos,
    getReporteChecadasQuincena,
    getReporteIncidenciasRRHH
} from '../controllers/reportes.controller.js';
import { verificarAutenticacion } from '../middleware/auth.middleware.js';
import { verificarEmpresa } from '../middleware/tenant.middleware.js';
import { requirePermiso } from '../middleware/permissions.middleware.js';

const router = Router();

router.use(verificarAutenticacion);
router.use(verificarEmpresa);

// Estadísticas
router.get('/estadisticas-globales', requirePermiso('REPORTE_EXPORTAR', 'REGISTRO_VER'), getEstadisticasGlobales);
router.get('/estadisticas-empleado/:empleadoId', (req, res, next) => {
    if (req.usuario && String(req.params.empleadoId) === String(req.usuario.empleado_id)) {
        return next();
    }
    return requirePermiso('REPORTE_EXPORTAR', 'REGISTRO_VER', 'REPORTE_VER')(req, res, next);
}, getEstadisticasEmpleado);
router.get('/comparativa-departamentos', getComparativaDepartamentos);
router.get('/estadisticas-departamento/:departamentoId', requirePermiso('REPORTE_EXPORTAR', 'REGISTRO_VER'), getEstadisticasDepartamento);

// Detalles para exportación
router.get('/detalle-asistencias', (req, res, next) => {
    if (req.usuario && req.query.empleado_id && String(req.query.empleado_id) === String(req.usuario.empleado_id)) {
        return next();
    }
    return requirePermiso('REPORTE_EXPORTAR', 'REGISTRO_VER', 'REPORTE_VER')(req, res, next);
}, getDetalleAsistencias);
router.get('/detalle-incidencias', (req, res, next) => {
    if (req.usuario && req.query.empleado_id && String(req.query.empleado_id) === String(req.usuario.empleado_id)) {
        return next();
    }
    return requirePermiso('REPORTE_EXPORTAR', 'REGISTRO_VER', 'REPORTE_VER')(req, res, next);
}, getDetalleIncidencias);

// Desempeño
router.get('/desempeno', requirePermiso('REPORTE_EXPORTAR'), getReporteDesempeno);

// Reporte Quincena (formato RRHH TecNM)
router.get('/checadas/quincena', requirePermiso('REPORTE_EXPORTAR', 'REGISTRO_VER'), getReporteChecadasQuincena);
router.get('/incidencias/rrhh', requirePermiso('REPORTE_EXPORTAR', 'REGISTRO_VER'), getReporteIncidenciasRRHH);

export default router;
