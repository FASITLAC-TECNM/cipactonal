-- Este script sincroniza las secuencias saltando a un número alto (100,000)
-- para asegurar que no haya colisión con los IDs que ya existen en las tablas.

SELECT setval('seq_usuarios', 100000);
SELECT setval('seq_empleados', 100000);
SELECT setval('seq_roles', 100000);
SELECT setval('seq_departamentos', 100000);
SELECT setval('seq_horarios', 100000);
SELECT setval('seq_tolerancias', 100000);
SELECT setval('seq_asistencias', 100000);
SELECT setval('seq_incidencias', 100000);
SELECT setval('seq_credenciales', 100000);
SELECT setval('seq_escritorio', 100000);
SELECT setval('seq_movil', 100000);
SELECT setval('seq_biometrico', 100000);
SELECT setval('seq_solicitudes', 100000);
SELECT setval('seq_eventos', 100000);
SELECT setval('seq_configuraciones', 100000);
SELECT setval('seq_empresas', 100000);
SELECT setval('seq_modulos', 100000);
SELECT setval('seq_permisos', 100000);
SELECT setval('seq_usuarios_roles', 100000);
SELECT setval('seq_empleados_departamentos', 100000);
SELECT setval('seq_auditoria', 100000);
SELECT setval('seq_dias_festivos', 100000);
SELECT setval('seq_avisos', 100000);
SELECT setval('seq_avisos_empleados', 100000);
SELECT setval('seq_system_logs', 100000);
