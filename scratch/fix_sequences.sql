-- Ejecutar este script en Railway (Data > Query o usando pgAdmin/psql) para crear todas las secuencias faltantes

CREATE SEQUENCE IF NOT EXISTS seq_usuarios START 1;
CREATE SEQUENCE IF NOT EXISTS seq_empleados START 1;
CREATE SEQUENCE IF NOT EXISTS seq_roles START 1;
CREATE SEQUENCE IF NOT EXISTS seq_departamentos START 1;
CREATE SEQUENCE IF NOT EXISTS seq_horarios START 1;
CREATE SEQUENCE IF NOT EXISTS seq_tolerancias START 1;
CREATE SEQUENCE IF NOT EXISTS seq_asistencias START 1;
CREATE SEQUENCE IF NOT EXISTS seq_incidencias START 1;
CREATE SEQUENCE IF NOT EXISTS seq_credenciales START 1;
CREATE SEQUENCE IF NOT EXISTS seq_escritorio START 1;
CREATE SEQUENCE IF NOT EXISTS seq_movil START 1;
CREATE SEQUENCE IF NOT EXISTS seq_biometrico START 1;
CREATE SEQUENCE IF NOT EXISTS seq_solicitudes START 1;
CREATE SEQUENCE IF NOT EXISTS seq_eventos START 1;
CREATE SEQUENCE IF NOT EXISTS seq_configuraciones START 1;
CREATE SEQUENCE IF NOT EXISTS seq_empresas START 1;
CREATE SEQUENCE IF NOT EXISTS seq_modulos START 1;
CREATE SEQUENCE IF NOT EXISTS seq_permisos START 1;
CREATE SEQUENCE IF NOT EXISTS seq_usuarios_roles START 1;
CREATE SEQUENCE IF NOT EXISTS seq_empleados_departamentos START 1;
CREATE SEQUENCE IF NOT EXISTS seq_auditoria START 1;
CREATE SEQUENCE IF NOT EXISTS seq_dias_festivos START 1;
CREATE SEQUENCE IF NOT EXISTS seq_avisos START 1;
CREATE SEQUENCE IF NOT EXISTS seq_avisos_empleados START 1;
CREATE SEQUENCE IF NOT EXISTS seq_system_logs START 1;

-- Opcional: Asegurarnos de que el dueño siga siendo el current user (esto es automático en Postgres al crearlo)
