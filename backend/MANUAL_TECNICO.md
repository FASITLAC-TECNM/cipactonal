# FASITLAC — Sistema de Control de Asistencia (API Checador)

**Versión:** 2.0.0  
**Fecha de elaboración:** 6 de mayo de 2026  
**Organización:** FASITLAC — Gestión de Asistencia Profesional  
**Clasificación:** Documentación Técnica Interna  

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Descripción General del Sistema](#2-descripción-general-del-sistema)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Especificaciones Técnicas](#4-especificaciones-técnicas)
5. [Módulos y Componentes](#5-módulos-y-componentes)
6. [APIs y Servicios](#6-apis-y-servicios)
7. [Seguridad](#7-seguridad)
8. [Integración con Sistemas Externos](#8-integración-con-sistemas-externos)
9. [Instalación y Despliegue](#9-instalación-y-despliegue)
10. [Configuración y Personalización](#10-configuración-y-personalización)
11. [Mantenimiento](#11-mantenimiento)
12. [Solución de Problemas](#12-solución-de-problemas)
13. [Desarrollo y Contribución](#13-desarrollo-y-contribución)
14. [Anexos](#14-anexos)

---

## Control de Versiones del Documento

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-01-01 | Daniel Soto | Creación inicial |
| 2.0 | 2026-05-06 | Daniel Soto | Refactorización multi-tenant, permisos bitwise, biometría facial |

---

## 1. Introducción

### 1.1 Propósito del Manual

Este manual técnico documenta exhaustivamente la **API REST** del sistema FASITLAC (api-checador), un backend Node.js/Express multi-tenant diseñado para la gestión integral de asistencia laboral. Cubre arquitectura, endpoints, seguridad, despliegue y mantenimiento.

### 1.2 Alcance del Sistema

El sistema cubre:
- Registro y clasificación automática de asistencias (entrada/salida/falta/retardo)
- Autenticación multi-nivel (usuarios, dispositivos kiosko, app móvil, terminales biométricas)
- Control de acceso por permisos bitwise (hasta 64 permisos simultáneos)
- Aislamiento multi-tenant por empresa
- Reconocimiento facial para autenticación biométrica
- Tareas programadas (cron) para gestión automática de faltas y salidas

### 1.3 Audiencia Objetivo

| Perfil | Secciones Relevantes |
|--------|---------------------|
| **Desarrollador Backend** | 3, 4, 5, 6, 13 |
| **DevOps / SRE** | 4, 9, 10, 11 |
| **Arquitecto de Software** | 2, 3, 5, 7 |
| **Administrador de Sistema** | 9, 10, 11, 12 |

### 1.4 Convenciones

- `código_inline` → comandos, nombres de archivos, variables de entorno
- **Negrita** → conceptos críticos o términos técnicos importantes
- `{variable}` → valor dinámico que debe sustituirse
- `> [!IMPORTANT]` → información crítica que no debe omitirse

### 1.5 Glosario de Términos Técnicos

| Término | Definición |
|---------|-----------|
| **Multi-tenant** | Arquitectura donde múltiples empresas (tenants) comparten la misma instancia del sistema con datos aislados |
| **Bitwise** | Sistema de permisos usando operaciones bit a bit sobre un entero de 64 bits (BigInt) |
| **SaaS Owner** | Propietario del sistema con acceso irrestricto a todos los tenants |
| **Kiosko** | Dispositivo de escritorio/tablet fijo para registro de asistencia |
| **Credencial biométrica** | Descriptor facial de 128 floats generado por face-api.js |
| **Motor de reglas** | Módulo intercambiable que define cómo se clasifican retardos y faltas |
| **CIDR** | Notación de bloque de red IPv4 (ej. `192.168.1.0/24`) |
| **Geofencing** | Restricción de check-in basada en coordenadas GPS y radio |
| **SSE** | Server-Sent Events — canal unidireccional servidor→cliente para tiempo real |
| **JWT** | JSON Web Token — estándar de autenticación sin estado |
| **Pool** | Conjunto de conexiones reutilizables a la base de datos PostgreSQL |
| **Prefijo empresa** | Código corto (ej. `FAS`) que se antepone a todos los IDs generados |


---

## 2. Descripción General del Sistema

### 2.1 Objetivos y Funcionalidades Principales

FASITLAC es una API REST construida con **Node.js + Express** que resuelve la gestión automatizada de asistencia laboral para múltiples empresas. Sus funcionalidades principales son:

- ✅ Registro de entradas y salidas desde múltiples canales (kiosko web, app móvil, terminal biométrica)
- ✅ Clasificación automática de asistencias: `puntual`, `retardo_a`, `retardo_b`, `falta`
- ✅ Generación automática de faltas no registradas (cron nocturno)
- ✅ Detección de salidas no cumplidas (cron cada 15 min)
- ✅ Reconocimiento facial para autenticación en terminales biométricas
- ✅ Sistema de solicitudes de incidencias con flujo de aprobación
- ✅ Reportes de asistencia con soporte de formato RRHH (TecNM)
- ✅ Notificaciones en tiempo real vía Server-Sent Events (SSE)
- ✅ Validación de red CIDR, geofencing GPS y WiFi por empresa
- ✅ Auditoría completa con logs persistidos en base de datos

### 2.2 Contexto de Uso

El sistema opera como **backend headless**: no tiene interfaz de usuario propia. Se integra con:

- **Aplicación web de escritorio** (panel administrativo, kiosko de registro)
- **Aplicación móvil** (registro de asistencia por GPS/WiFi)
- **Terminales biométricas** (reconocimiento facial físico)

### 2.3 Tipos de Usuarios del Sistema

| Tipo | Descripción | Autenticación |
|------|-------------|---------------|
| **Propietario SaaS** | Dueño de la plataforma, acceso total | Token `saas_<id>` |
| **Administrador empresa** | Gestiona su empresa, rol `es_admin=true` | JWT / userId |
| **Usuario estándar** | Permisos específicos por roles bitwise | JWT / userId |
| **Empleado** | Registro de asistencia propia | JWT / userId |
| **Kiosko/Escritorio** | Dispositivo de registro fijo | JWT con rol `Escritorio`/`Kiosko` |
| **App Móvil** | Registro desde smartphone | JWT con rol `Movil` |

### 2.4 Diagrama Conceptual del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES / CANALES                        │
│  [Panel Web]  [App Móvil]  [Terminal Biométrica]  [Kiosko]  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST / SSE
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   API FASITLAC (Express)                     │
│                                                              │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐  │
│  │   Auth   │  │ Permisos  │  │  Tenant  │  │  Errores  │  │
│  │Middleware│  │ Bitwise   │  │Isolation │  │ Handler   │  │
│  └──────────┘  └───────────┘  └──────────┘  └───────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   CONTROLADORES (27)                  │   │
│  │  Auth │ Usuarios │ Empleados │ Asistencias │ ...     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   CRON JOBS     │    │      SERVICIOS / UTILS        │   │
│  │  - FaltasCron   │    │  - faceRecognition.service    │   │
│  │  - SalidasCron  │    │  - networkValidator           │   │
│  └─────────────────┘    │  - asistenciaClassifier       │   │
│                         │  - motores_reglas              │   │
│                         └──────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL (pg Pool)                        │
│    Esquema único, aislamiento por empresa_id (tenant)        │
└─────────────────────────────────────────────────────────────┘
```


---

## 3. Arquitectura del Sistema

### 3.1 Patrón de Arquitectura

El sistema implementa una **arquitectura en capas** (Layered Architecture) siguiendo el patrón **MVC adaptado para APIs REST**:

```
Capa de Enrutamiento  →  routes/*.routes.js
Capa de Middleware    →  middleware/*.middleware.js
Capa de Negocio       →  controllers/*.controller.js
Capa de Servicios     →  services/*.service.js
Capa de Utilidades    →  utils/*.js
Capa de Datos         →  config/db.js → PostgreSQL
```

**Patrones de diseño implementados:**
- **Middleware Chain** — Cadena de middlewares Express (auth → tenant → permissions → controller)
- **Repository Pattern** — Acceso a BD centralizado en controladores mediante `pool.query()`
- **Strategy Pattern** — Motor de reglas intercambiable (`dinamico` vs `tecnm_art80`)
- **Singleton** — Pool de conexiones PostgreSQL compartido globalmente
- **Context Pattern** — `AsyncLocalStorage` para propagación del contexto de empresa entre llamadas asíncronas

### 3.2 Stack Tecnológico Completo

#### Lenguajes y Runtime

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Runtime | Node.js | ≥ 18.x (ESModules) |
| Lenguaje | JavaScript (ES2022) | `"type": "module"` |
| Módulos | ESM nativo | `import`/`export` |

#### Framework y Librerías Principales

| Librería | Versión | Propósito |
|---------|---------|-----------|
| `express` | ^4.18.2 | Framework HTTP REST |
| `express-async-errors` | ^3.1.1 | Propagación automática de errores async |
| `cors` | ^2.8.5 | Control de Cross-Origin Resource Sharing |
| `pg` | ^8.16.3 | Driver PostgreSQL (node-postgres) |
| `jsonwebtoken` | ^9.0.3 | Generación y verificación de JWT |
| `bcrypt` | ^6.0.0 | Hash seguro de contraseñas |
| `dotenv` | ^16.0.3 | Gestión de variables de entorno |
| `zod` | ^4.3.6 | Validación de esquemas de entrada |
| `node-cron` | ^4.2.1 | Tareas programadas (cron jobs) |
| `winston` | ^3.19.0 | Sistema de logging estructurado |
| `nodemailer` | ^8.0.3 | Envío de correos electrónicos vía SMTP |
| `node-fetch` | ^3.3.2 | Cliente HTTP para llamadas externas |

#### Reconocimiento Facial

| Librería | Versión | Propósito |
|---------|---------|-----------|
| `@vladmandic/face-api` | ^1.7.15 | Detección y reconocimiento facial |
| `@tensorflow/tfjs` | ^4.22.0 | Backend de ML (CPU puro) |
| `@tensorflow/tfjs-backend-cpu` | ^4.22.0 | Backend CPU para TensorFlow.js |
| `canvas` | ^3.2.1 | Procesamiento de imágenes en Node.js |

#### Herramientas de Desarrollo

| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| `nodemon` | ^3.0.1 | Hot-reload en desarrollo |
| `pnpm` | any | Gestor de paquetes (lock file presente) |

### 3.3 Estructura de Directorios

```
api-checador/
├── src/
│   ├── app.js                          # Configuración Express (middlewares + rutas)
│   ├── server.js                       # Punto de entrada: listen + cron jobs
│   ├── config/
│   │   ├── db.js                       # Pool PostgreSQL con keep-alive
│   │   └── constants.js                # Constantes HTTP_STATUS
│   ├── controllers/                    # 30 controladores (lógica de negocio)
│   │   ├── asistencias.controller.js   # Registro y clasificación de asistencias
│   │   ├── auth.controller.js          # Login, logout, tokens de dispositivos
│   │   ├── biometrico.controller.js    # Gestión de terminales biométricas
│   │   ├── credenciales.controller.js  # Credenciales faciales
│   │   ├── empleados.controller.js     # CRUD empleados
│   │   ├── empresas.controller.js      # CRUD empresas (multi-tenant)
│   │   ├── escritorio.controller.js    # Gestión de dispositivos kiosko
│   │   ├── escritorio.sync.controller.js    # Sincronización offline escritorio
│   │   ├── escritorio.sync.raw.controller.js # Sincronización raw punch
│   │   ├── horarios.controller.js      # CRUD horarios y turnos
│   │   ├── incidencias.controller.js   # Gestión de incidencias laborales
│   │   ├── movil.controller.js         # Gestión de dispositivos móviles
│   │   ├── movil.sync.controller.js    # Sincronización offline móvil
│   │   ├── reportes.controller.js      # Generación de reportes y estadísticas
│   │   ├── roles.controller.js         # CRUD roles y permisos
│   │   ├── solicitudes.controller.js   # Flujo de afiliación de dispositivos
│   │   ├── usuarios.controller.js      # CRUD usuarios y asignación de roles
│   │   └── ...                         # (otros 13 controladores)
│   ├── middleware/
│   │   ├── auth.middleware.js          # Verificación JWT/sesión + rol de dispositivo
│   │   ├── permissions.middleware.js   # Control de acceso por bits
│   │   ├── tenant.middleware.js        # Aislamiento por empresa (multi-tenant)
│   │   ├── error.middleware.js         # Captura global de errores
│   │   ├── validate.middleware.js      # Validación de esquemas Zod
│   │   └── service.middleware.js       # Middleware de servicio auxiliar
│   ├── routes/                         # 27 archivos de rutas
│   │   ├── auth.routes.js
│   │   ├── asistencias.routes.js
│   │   └── ...
│   ├── services/
│   │   ├── asistencias.service.js      # Lógica de negocio de asistencias
│   │   └── faceRecognition.service.js  # Integración TensorFlow + face-api
│   ├── schemas/
│   │   └── empleados.schema.js         # Esquemas Zod de validación
│   ├── jobs/
│   │   ├── faltasCron.js               # Registro automático de faltas (23:59)
│   │   └── salidasCron.js              # Detección salidas no cumplidas (*/15 min)
│   └── utils/
│       ├── asistenciaClassifier.js     # Clasificador puntual/retardo/falta
│       ├── context.js                  # AsyncLocalStorage (contexto empresa)
│       ├── emailValidator.js           # Validación de emails
│       ├── eventos.js                  # Utilidades de registro de eventos
│       ├── idGenerator.js              # Generador de IDs con prefijo empresa
│       ├── logger.js                   # Winston + logs persistidos en BD
│       ├── mailer.js                   # Plantillas y envío de correos
│       ├── networkValidator.js         # Validación CIDR/GPS/WiFi
│       ├── permissions.js              # Catálogo y operaciones bitwise
│       ├── response.js                 # Helpers sendSuccess/sendError
│       ├── sse.js                      # Server-Sent Events (broadcast)
│       └── motores_reglas/
│           ├── index.js                # Factory del motor de reglas
│           ├── dinamico.js             # Motor dinámico configurable
│           └── tecnm_art80.js          # Motor reglamento TecNM Art. 80
├── scripts/
│   ├── cleanup_db.js                   # Limpieza de datos temporales
│   ├── cleanup_static_tables.sql       # SQL de limpieza de tablas estáticas
│   ├── migrate_permissions.js          # Migración de permisos bitwise v1→v2
│   ├── migration_comandos.js           # Script de comandos de migración
│   └── migration_horarios_asistencias.js  # Migración de horarios
├── public/
│   └── models/                         # Modelos TensorFlow (face-api)
├── logs/
│   └── error.log                       # Log de errores de Winston
├── .env                                # Variables de entorno (NO commitear)
├── .gitignore
├── package.json
└── pnpm-lock.yaml
```


---

## 4. Especificaciones Técnicas

### 4.1 Requisitos de Hardware

| Recurso | Mínimo | Recomendado (Producción) |
|---------|--------|--------------------------|
| CPU | 2 vCPU | 4+ vCPU |
| RAM | 2 GB | 8 GB (TensorFlow requiere ~1.5 GB) |
| Disco | 5 GB | 20 GB SSD |
| Red | 10 Mbps | 100 Mbps |

> **Nota:** El módulo de reconocimiento facial (`@tensorflow/tfjs-backend-cpu`) incrementa el consumo de RAM significativamente. En entornos sin biometría facial, el requerimiento de RAM se reduce a 512 MB.

### 4.2 Requisitos de Software

| Software | Versión | Notas |
|---------|---------|-------|
| Node.js | ≥ 18.0.0 | Requerido por ESModules y `AsyncLocalStorage` |
| PostgreSQL | ≥ 14.x | Soporte para `BIGINT`, sequences, JSON |
| npm / pnpm | cualquiera | Se incluye `pnpm-lock.yaml` |
| Sistema Operativo | Linux (prod), macOS (dev) | Windows no probado |

### 4.3 Variables de Entorno

| Variable | Tipo | Ejemplo | Descripción |
|---------|------|---------|-------------|
| `PORT` | número | `3002` | Puerto donde escucha el servidor HTTP |
| `DB_HOST` | string | `localhost` | Host del servidor PostgreSQL |
| `DB_USER` | string | `postgres` | Usuario de la base de datos |
| `DB_PASSWORD` | string | `s3cret` | Contraseña de la base de datos |
| `DB_NAME` | string | `checador-fas` | Nombre de la base de datos |
| `DB_PORT` | número | `5432` | Puerto PostgreSQL |
| `NODE_ENV` | string | `development` | Entorno: `development` o `production` |
| `JWT_SECRET` | string | `clave-larga-aleatoria` | Secreto para firmar/verificar JWT |
| `BIOMETRIC_SERVICE_KEY` | string | `clave_secreta_larga` | Clave de autenticación para terminales biométricas |
| `EMAIL_USER` | string | `correo@gmail.com` | Cuenta Gmail para envío de notificaciones |
| `EMAIL_PASS` | string | `app-password` | App Password de Gmail (no la contraseña normal) |
| `LOG_LEVEL` | string | `info` | Nivel de log Winston: `error`, `warn`, `info`, `debug` |

Archivo `.env` de ejemplo completo:
```bash
PORT=3002
DB_USER=postgres
DB_HOST=localhost
DB_NAME=checador-fas
DB_PASSWORD=tu_password_seguro
DB_PORT=5432
NODE_ENV=development
JWT_SECRET=genera_una_cadena_aleatoria_larga_aqui_256bits
BIOMETRIC_SERVICE_KEY=clave_secreta_biometrica_muy_larga_123456
EMAIL_USER=notificaciones@tuempresa.com
EMAIL_PASS=app_password_de_gmail
LOG_LEVEL=info
```

### 4.4 Puertos y Protocolos

| Puerto | Protocolo | Servicio | Notas |
|--------|-----------|---------|-------|
| `3002` | HTTP | API Principal | Configurable vía `PORT` |
| `5432` | TCP | PostgreSQL | Conexión interna |
| `587/465` | SMTP/TLS | Gmail (nodemailer) | Para notificaciones por correo |

### 4.5 Configuración del Pool de Base de Datos

```javascript
// src/config/db.js
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    idleTimeoutMillis: 30000,   // Cierra conexiones idle tras 30s
    keepAlive: true,            // Mantiene TCP vivo
    keepAliveInitialDelayMillis: 10000  // Primer keepalive a los 10s
});
```

---

## 5. Módulos y Componentes

### 5.1 Módulo de Autenticación (`auth.controller.js`)

**Descripción:** Gestiona todos los flujos de autenticación del sistema.

**Responsabilidades:**
- Login de usuarios con validación de credenciales y bcrypt
- Login SaaS para propietarios del sistema
- Generación de tokens JWT para dispositivos (Kiosko, Móvil, Escritorio)
- Login biométrico por identificador de huella/rostro
- Verificación de sesión activa
- Cambio de contraseña con validación previa

**Interfaces principales:**

```javascript
// Genera token de 6 meses para un kiosko
export async function tokenKiosco(req, res)

// Autentica por descriptor facial comparando contra credenciales BD
export async function loginBiometrico(req, res)

// Permite al SaaS Owner impersonar una empresa
export async function impersonarEmpresa(req, res)
```

**Flujo de Login:**
```
POST /api/auth/login
  ↓
Buscar usuario por username/correo en BD
  ↓
Verificar estado_cuenta = 'activo'
  ↓
bcrypt.compare(password, hash_almacenado)
  ↓
Obtener roles y calcular permisos bitwise (OR de todos los roles)
  ↓
Responder { success: true, data: { usuario, token, permisos } }
```

---

### 5.2 Módulo de Asistencias (`asistencias.controller.js`)

**Descripción:** Núcleo del sistema. Gestiona el registro, clasificación y consulta de asistencias.

**Responsabilidades:**
- Registro de entradas y salidas desde cualquier canal
- Clasificación automática usando el motor de reglas de la empresa
- Cálculo de minutos tarde y estado de asistencia
- Validaciones de red (CIDR/GPS/WiFi) antes de registrar
- Registro preflight para determinar si el botón de check-in debe estar activo

**Flujo de registro de asistencia:**
```
POST /api/asistencias/registrar
  ↓
Verificar autenticación + tenant
  ↓
Cargar configuración y tolerancias de la empresa
  ↓
Ejecutar validaciones de red (networkValidator)
  ↓
Determinar tipo (entrada/salida) según registros previos del día
  ↓
Obtener horario del empleado y calcular minutos tarde
  ↓
Clasificar estado: puntual / retardo_a / retardo_b / falta
  ↓
Insertar en tabla `asistencias` con ID prefijado
  ↓
Insertar evento en tabla `eventos`
  ↓
Broadcast SSE a clientes conectados
  ↓
Responder con estado clasificado y advertencias de red
```

---

### 5.3 Motor de Reglas de Asistencia (`utils/motores_reglas/`)

**Descripción:** Sistema intercambiable de clasificación de asistencias según políticas de la empresa.

**Motores disponibles:**

| Motor | Identificador BD | Descripción |
|-------|-----------------|-------------|
| Dinámico | `dinamico` | Configurable por umbrales en tabla `tolerancias` |
| TecNM Art. 80 | `tecnm_art80` | Reglamento institucional del Tecnológico Nacional de México |

**Clasificador base (`asistenciaClassifier.js`):**
```javascript
// Clasifica según minutos tarde y tolerancias configuradas
export function clasificarMinutos(minutosTarde, tolerancia) {
    const { minutos_retardo = 10, minutos_retardo_a_max = 20,
            minutos_retardo_b_max = 29 } = tolerancia;

    if (minutosTarde <= minutos_retardo) return 'puntual';
    if (minutosTarde <= minutos_retardo_a_max) return 'retardo_a';
    if (minutosTarde <= minutos_retardo_b_max) return 'retardo_b';
    return 'falta';  // Art. 80c: > 30 min = falta
}

// Equivalencias: 10 Retardo A = 1 falta / 5 Retardo B = 1 falta
export function calcularEquivalencias(totalRetardosA, totalRetardosB, tolerancia)
```

---

### 5.4 Sistema de Permisos Bitwise (`utils/permissions.js`)

**Descripción:** Implementa control de acceso granular usando operaciones bit a bit sobre enteros de 64 bits (BigInt de JavaScript).

**Catálogo de permisos (39 permisos definidos):**

| Código | Bit | Módulo | Descripción |
|--------|-----|--------|-------------|
| `USUARIO_VER` | 0 | Usuarios | Ver lista de usuarios y empleados |
| `USUARIO_CREAR` | 1 | Usuarios | Registrar nuevos usuarios |
| `USUARIO_EDITAR` | 2 | Usuarios | Modificar datos de usuarios |
| `USUARIO_ELIMINAR` | 3 | Usuarios | Desactivar usuarios |
| `ROL_VER` | 4 | Roles | Ver lista de roles |
| `ROL_CREAR` | 5 | Roles | Crear nuevos roles |
| `ROL_EDITAR` | 6 | Roles | Modificar roles |
| `ROL_ELIMINAR` | 7 | Roles | Desactivar roles |
| `ROL_ASIGNAR` | 8 | Roles | Asignar roles a usuarios |
| `HORARIO_VER` | 9 | Horarios | Ver horarios |
| `HORARIO_CREAR` | 10 | Horarios | Crear horarios |
| `HORARIO_EDITAR` | 11 | Horarios | Modificar horarios |
| `HORARIO_ELIMINAR` | 12 | Horarios | Desactivar horarios |
| `HORARIO_ASIGNAR` | 13 | Horarios | Asignar horarios a empleados |
| `HORARIO_GESTIONAR` | 14 | Horarios | Aprobar/declinar incidencias |
| `DEPARTAMENTO_VER` | 15 | Departamentos | Ver departamentos |
| `DEPARTAMENTO_CREAR` | 16 | Departamentos | Crear departamentos |
| `DEPARTAMENTO_EDITAR` | 17 | Departamentos | Modificar departamentos |
| `DEPARTAMENTO_ELIMINAR` | 18 | Departamentos | Desactivar departamentos |
| `DEPARTAMENTO_ASIGNAR` | 19 | Departamentos | Asignar empleados a departamentos |
| `DISPOSITIVO_VER` | 20 | Dispositivos | Ver dispositivos registrados |
| `DISPOSITIVO_CREAR` | 21 | Dispositivos | Registrar nuevos dispositivos |
| `DISPOSITIVO_EDITAR` | 22 | Dispositivos | Modificar configuración de dispositivos |
| `DISPOSITIVO_ELIMINAR` | 23 | Dispositivos | Desactivar dispositivos |
| `DISPOSITIVO_GESTIONAR` | 24 | Dispositivos | Aprobar/rechazar solicitudes de afiliación |
| `AVISO_VER` | 25 | Avisos | Ver avisos del sistema |
| `AVISO_CREAR` | 26 | Avisos | Crear avisos |
| `AVISO_EDITAR` | 27 | Avisos | Modificar avisos |
| `AVISO_ELIMINAR` | 28 | Avisos | Desactivar avisos |
| `REPORTE_VER` | 29 | Reportes | Ver módulo de reportes |
| `REPORTE_EXPORTAR` | 30 | Reportes | Exportar reportes PDF/Excel |
| `REGISTRO_VER` | 31 | Asistencias | Ver registros de entrada/salida |
| `CONFIG_VER` | 32 | Configuración | Ver panel de configuración |
| `CONFIG_GENERAL` | 33 | Configuración | Modificar configuración general |
| `CONFIG_EMPRESA` | 34 | Configuración | Modificar datos de empresa |
| `CONFIG_SEGURIDAD` | 35 | Configuración | Modificar parámetros de seguridad |
| `CONFIG_ASISTENCIA` | 36 | Configuración | Modificar reglas de asistencia |
| `CONFIG_RED` | 37 | Configuración | Modificar parámetros de red/IPs |
| `CONFIG_REPORTES` | 38 | Configuración | Modificar estructura de reportes |

**Operaciones sobre permisos:**
```javascript
// Verificar si tiene un permiso específico
export function tienePermiso(permisosBitwise, bitPosition) {
    const permisos = BigInt(permisosBitwise || 0);
    const mask = BigInt(1) << BigInt(bitPosition);
    return (permisos & mask) !== BigInt(0);
}

// Grupos predefinidos de permisos
export const GRUPOS_PERMISOS = {
    ADMIN_ESTANDAR: crearPermisos(Object.values(PERMISOS)), // Todos los bits
    EMPLEADO_BASICO: crearPermisos([PERMISOS.REGISTRO_VER]), // Solo ver sus propios registros
    SUPERVISOR: crearPermisos([
        PERMISOS.USUARIO_VER, PERMISOS.REGISTRO_VER,
        PERMISOS.REPORTE_VER, PERMISOS.REPORTE_EXPORTAR,
        PERMISOS.HORARIO_VER, PERMISOS.HORARIO_GESTIONAR
    ])
};
```

**Jerarquía de configuración:**
```javascript
// Umbral máximo de posición de rol para acceder a cada config
export const JERARQUIA_CONFIGURACION = {
    CONFIG_VER: 99,       // Cualquier admin
    CONFIG_REPORTES: 99,  // Cualquier admin
    CONFIG_GENERAL: 5,    // Solo gerencia y superior
    CONFIG_ASISTENCIA: 5, // Solo gerencia y superior
    CONFIG_RED: 2,        // Solo IT/Gerencia alta
    CONFIG_EMPRESA: 1,    // Solo dueño
    CONFIG_SEGURIDAD: 1   // Solo dueño
};
```


### 5.5 Validador de Red (`utils/networkValidator.js`)

**Descripción:** Valida que las solicitudes de asistencia provengan de ubicaciones autorizadas. Soporta tres tipos de validación extensibles.

**Tipos de validación:**

| Tipo | Estado | Descripción |
|------|--------|-------------|
| CIDR / Segmentos de red | ✅ Implementado | Compara IP del cliente contra CIDRs configurados en `configuraciones.segmentos_red` |
| GPS / Geofencing | ✅ Implementado | Geocercas circulares (Haversine) y poligonales (Ray Casting) |
| WiFi / Triangulación | ✅ Estructura lista | Compara BSSID/SSID reportado contra lista de redes autorizadas |

**Algoritmos implementados:**
```javascript
// Cálculo de distancia GPS (fórmula de Haversine)
function haversineMetros(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const toRad = deg => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Point-in-Polygon (Ray Casting) para geocercas poligonales
function puntoEnPoligono(lat, lng, vertices) { ... }
```

---

### 5.6 Servicio de Reconocimiento Facial (`services/faceRecognition.service.js`)

**Descripción:** Integra TensorFlow.js + face-api.js para extraer y comparar descriptores faciales (vectores de 128 floats).

**Modelos utilizados:**
- `tinyFaceDetector` — Detección de rostros (rápido, menor consumo de memoria)
- `faceLandmark68Net` — 68 puntos de referencia facial
- `faceRecognitionNet` — Generación de descriptor de 128 dimensiones

**Flujo de extracción de descriptor:**
```javascript
export async function extractDescriptorFromImage(imageBuffer) {
    if (!modelsLoaded) await loadModels();
    const img = new Image();
    img.src = imageBuffer;
    const detections = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();
    return detections?.descriptor ?? null; // Float32Array de 128 elementos
}
```

Los modelos deben ubicarse en `public/models/`.

---

### 5.7 Generador de IDs (`utils/idGenerator.js`)

**Descripción:** Genera identificadores únicos y rastreables por entidad y empresa.

**Formato:** `{PREFIJO_EMPRESA}-{PREFIJO_ENTIDAD}-{HEX_32_CHARS}`

**Ejemplo:** `FAS-ASI-00000000000000000000000000000001`

**Prefijos de entidades:**

| Entidad | Prefijo | Secuencia PostgreSQL |
|---------|---------|---------------------|
| Usuario | `USU` | `seq_usuarios` |
| Empleado | `EMP` | `seq_empleados` |
| Asistencia | `ASI` | `seq_asistencias` |
| Rol | `ROL` | `seq_roles` |
| Departamento | `DEP` | `seq_departamentos` |
| Horario | `HOR` | `seq_horarios` |
| Credencial | `CRE` | `seq_credenciales` |
| Escritorio | `ESC` | `seq_escritorio` |
| Móvil | `MOV` | `seq_movil` |
| Biométrico | `BIO` | `seq_biometrico` |
| Solicitud | `SOL` | `seq_solicitudes` |
| Log | `LOG` | `seq_system_logs` |

---

### 5.8 Sistema de Notificaciones SSE (`utils/sse.js`)

**Descripción:** Canal unidireccional servidor→clientes para notificaciones en tiempo real.

```javascript
// Agregar cliente al canal de notificaciones
export function addClient(res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write(':connected\n\n');
    clients.add(res);
    // Heartbeat cada 30s para mantener viva la conexión
    const heartbeat = setInterval(() => res.write(':heartbeat\n\n'), 30000);
    res.on('close', () => { clearInterval(heartbeat); clients.delete(res); });
}

// Emitir evento a todos los clientes conectados
export function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) client.write(payload);
}
```

---

### 5.9 Cron Jobs (`jobs/`)

#### `faltasCron.js` — Registro Automático de Faltas
- **Programación:** `59 23 * * *` — todos los días a las 23:59
- **Zona horaria:** `America/Mexico_City`
- **Lógica:** Recorre todos los empleados activos con horario asignado. Si el empleado tenía turno ese día y no registró asistencia, crea un registro de `falta` automática y su evento correspondiente.

#### `salidasCron.js` — Detección de Salidas No Cumplidas
- **Programación:** `*/15 * * * *` — cada 15 minutos
- **Zona horaria:** `America/Mexico_City`
- **Lógica:** Revisa empleados que registraron entrada pero no salida en el bloque horario actual, después del límite de tolerancia. Registra `salida_no_cumplida` con estado `sistema`.


---

## 6. APIs y Servicios

### 6.1 URL Base

```
http://{host}:{PORT}/api
```

Por defecto en desarrollo: `http://localhost:3002/api`

### 6.2 Formato de Respuesta Estándar

**Éxito:**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "detalle técnico (solo en development)",
  "stack": "stack trace (solo en development)"
}
```

### 6.3 Autenticación de Endpoints

Todos los endpoints (excepto los marcados como públicos) requieren:
```
Authorization: Bearer <token>
```

**Formatos de token aceptados:**

| Formato | Tipo de Usuario | Ejemplo |
|---------|----------------|---------|
| `saas_<id>` | Propietario SaaS | `saas_SAAS00001` |
| JWT válido con `sub` | Usuario regular / Dispositivo | `eyJhbGc...` |
| `<userId>` directo | Legacy (compatibilidad) | `USU-USU-000...` |

### 6.4 Tabla de Endpoints Completa

#### Autenticación (`/api/auth`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | ❌ Pública | Login de usuario con usuario/contraseña |
| `POST` | `/api/auth/login-saas` | ❌ Pública | Login de propietario SaaS |
| `POST` | `/api/auth/biometric` | ❌ Pública | Login biométrico por descriptor facial |
| `POST` | `/api/auth/token-kiosco` | ❌ Pública | Generar token para dispositivo kiosko |
| `POST` | `/api/auth/token-movil` | ❌ Pública | Generar token para app móvil |
| `POST` | `/api/auth/token-escritorio` | ❌ Pública | Generar token para escritorio |
| `GET` | `/api/auth/verificar` | ✅ Bearer | Verificar validez de sesión actual |
| `POST` | `/api/auth/logout` | ✅ Bearer | Cerrar sesión |
| `POST` | `/api/auth/cambiar-password` | ✅ Bearer | Cambiar contraseña del usuario autenticado |
| `POST` | `/api/auth/impersonate` | ✅ Bearer | SaaS: impersonar empresa específica |

#### Usuarios (`/api/usuarios`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| `GET` | `/api/usuarios` | `USUARIO_VER` | Listar usuarios de la empresa |
| `GET` | `/api/usuarios/:id` | `USUARIO_VER` o self | Obtener usuario por ID |
| `GET` | `/api/usuarios/username/:username` | Auth | Buscar por nombre de usuario |
| `POST` | `/api/usuarios` | `USUARIO_CREAR` | Crear nuevo usuario |
| `PUT` | `/api/usuarios/:id` | `USUARIO_EDITAR` o self | Actualizar datos de usuario |
| `DELETE` | `/api/usuarios/:id` | `USUARIO_ELIMINAR` | Desactivar usuario |
| `PATCH` | `/api/usuarios/:id/reactivar` | `USUARIO_ELIMINAR` | Reactivar usuario |
| `GET` | `/api/usuarios/:id/roles` | `ROL_VER` o self | Listar roles del usuario |
| `POST` | `/api/usuarios/:id/roles` | `ROL_ASIGNAR` | Asignar rol al usuario |
| `DELETE` | `/api/usuarios/:id/roles/:rolId` | `ROL_ASIGNAR` | Remover rol del usuario |

#### Empleados (`/api/empleados`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| `GET` | `/api/empleados` | `USUARIO_VER` | Listar empleados de la empresa |
| `GET` | `/api/empleados/:id` | `USUARIO_VER` o self | Obtener empleado por ID |
| `PUT` | `/api/empleados/:id` | `USUARIO_EDITAR` | Actualizar datos del empleado (RFC, NSS, horario) |
| `GET` | `/api/empleados/buscar/rfc/:rfc` | `USUARIO_VER` | Buscar empleado por RFC |
| `GET` | `/api/empleados/buscar/nss/:nss` | `USUARIO_VER` | Buscar empleado por NSS |
| `GET` | `/api/empleados/:id/departamentos` | `DEPARTAMENTO_VER` o self | Obtener departamentos del empleado |
| `POST` | `/api/empleados/:id/departamentos` | `DEPARTAMENTO_ASIGNAR` | Asignar departamento |
| `DELETE` | `/api/empleados/:id/departamentos/:deptoId` | `DEPARTAMENTO_ASIGNAR` | Remover departamento |
| `GET` | `/api/empleados/:id/horario` | `HORARIO_VER` o self | Obtener horario del empleado |
| `GET` | `/api/empleados/:id/avisos` | `USUARIO_VER` o self | Obtener avisos del empleado |

#### Asistencias (`/api/asistencias`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| `GET` | `/api/asistencias` | `REGISTRO_VER` | Listar todas las asistencias de la empresa |
| `GET` | `/api/asistencias/hoy` | `REGISTRO_VER` | Asistencias del día actual |
| `POST` | `/api/asistencias/registrar` | Auth | Registrar entrada o salida |
| `POST` | `/api/asistencias/manual` | `REGISTRO_VER` | Registro manual de asistencia |
| `GET` | `/api/asistencias/empleado/:empleadoId` | `REGISTRO_VER` o self | Asistencias de un empleado |
| `GET` | `/api/asistencias/empleado/:empleadoId/equivalencias` | `REGISTRO_VER` o self | Equivalencias (retardos→faltas) |
| `GET` | `/api/asistencias/estado/:empleadoId` | `REGISTRO_VER` o self | Estado preflight (¿puede hacer check-in?) |
| `GET` | `/api/asistencias/movil/estado-boton/:empleadoId` | `REGISTRO_VER` o self | Estado del botón en app móvil |

#### Roles (`/api/roles`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| `GET` | `/api/roles` | `ROL_VER` | Listar roles de la empresa |
| `GET` | `/api/roles/:id` | `ROL_VER` | Obtener rol por ID |
| `POST` | `/api/roles` | `ROL_CREAR` | Crear nuevo rol |
| `PUT` | `/api/roles/:id` | `ROL_EDITAR` | Modificar rol y sus permisos |
| `DELETE` | `/api/roles/:id` | `ROL_ELIMINAR` | Desactivar rol |

#### Horarios (`/api/horarios`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| `GET` | `/api/horarios` | `HORARIO_VER` | Listar horarios |
| `GET` | `/api/horarios/:id` | `HORARIO_VER` | Obtener horario por ID |
| `POST` | `/api/horarios` | `HORARIO_CREAR` | Crear horario |
| `PUT` | `/api/horarios/:id` | `HORARIO_EDITAR` | Modificar horario |
| `DELETE` | `/api/horarios/:id` | `HORARIO_ELIMINAR` | Desactivar horario |
| `POST` | `/api/horarios/:id/asignar` | `HORARIO_ASIGNAR` | Asignar horario a empleado |

#### Biométrico (`/api/biometrico`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| `GET` | `/api/biometrico` | Auth | Listar terminales biométricas |
| `GET` | `/api/biometrico/:id` | `DISPOSITIVO_VER` | Obtener terminal por ID |
| `GET` | `/api/biometrico/escritorio/:escritorioId` | Auth | Biométricos de un escritorio |
| `GET` | `/api/biometrico/stats` | `DISPOSITIVO_VER` | Estadísticas de terminales |
| `POST` | `/api/biometrico` | `DISPOSITIVO_CREAR` | Registrar terminal |
| `PUT` | `/api/biometrico/:id` | `DISPOSITIVO_EDITAR` | Modificar terminal |
| `DELETE` | `/api/biometrico/:id` | `DISPOSITIVO_EDITAR` | Desactivar terminal |
| `PATCH` | `/api/biometrico/:id/estado` | Auth | Actualizar estado de terminal |
| `POST` | `/api/biometrico/sync-status` | Auth | Sincronizar estado desde terminal |

#### Solicitudes de Afiliación (`/api/solicitudes`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/solicitudes` | ❌ Pública | Crear solicitud de afiliación de dispositivo |
| `GET` | `/api/solicitudes/verificar/:token` | ❌ Pública | Verificar estado de solicitud por token |
| `GET` | `/api/solicitudes/stream` | ✅ Bearer | SSE: stream de solicitudes en tiempo real |
| `POST` | `/api/solicitudes/validar-afiliacion` | ✅ Bearer | Validar afiliación y red del dispositivo |
| `GET` | `/api/solicitudes` | `DISPOSITIVO_VER` | Listar solicitudes |
| `GET` | `/api/solicitudes/pendientes` | `DISPOSITIVO_GESTIONAR` | Listar solicitudes pendientes |
| `GET` | `/api/solicitudes/:id` | `DISPOSITIVO_VER` | Obtener solicitud por ID |
| `PATCH` | `/api/solicitudes/:id/aceptar` | `DISPOSITIVO_GESTIONAR` | Aceptar solicitud |
| `PATCH` | `/api/solicitudes/:id/rechazar` | `DISPOSITIVO_GESTIONAR` | Rechazar solicitud |
| `PATCH` | `/api/solicitudes/:id/pendiente` | ✅ Bearer | Reabrir solicitud rechazada |
| `DELETE` | `/api/solicitudes/:id` | ✅ Bearer | Cancelar solicitud |

#### Reportes (`/api/reportes`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| `GET` | `/api/reportes/estadisticas-globales` | `REPORTE_EXPORTAR` | Estadísticas globales de la empresa |
| `GET` | `/api/reportes/estadisticas-empleado/:id` | `REPORTE_EXPORTAR` | Estadísticas de un empleado |
| `GET` | `/api/reportes/estadisticas-departamento/:id` | `REPORTE_EXPORTAR` | Estadísticas por departamento |
| `GET` | `/api/reportes/comparativa-departamentos` | Auth | Comparativa entre departamentos |
| `GET` | `/api/reportes/detalle-asistencias` | `REPORTE_EXPORTAR` | Detalle de asistencias para exportar |
| `GET` | `/api/reportes/detalle-incidencias` | `REPORTE_EXPORTAR` | Detalle de incidencias para exportar |
| `GET` | `/api/reportes/desempeno` | `REPORTE_EXPORTAR` | Reporte de desempeño |
| `GET` | `/api/reportes/checadas/quincena` | `REPORTE_EXPORTAR` | Reporte quincena (formato RRHH TecNM) |
| `GET` | `/api/reportes/incidencias/rrhh` | `REPORTE_EXPORTAR` | Reporte incidencias RRHH |

#### Sincronización Escritorio (`/api/escritorio/sync`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/escritorio/sync/datos-referencia` | ✅ Bearer | Datos de referencia para sync incremental |
| `POST` | `/api/escritorio/sync/asistencias-pendientes` | ✅ Bearer | Sincronizar asistencias offline |
| `POST` | `/api/escritorio/sync/raw-punch` | ✅ Bearer | Sincronizar eventos raw sin procesar |

#### Sincronización Móvil (`/api/movil/sync`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/movil/sync/mis-datos` | ❌ Pública | Obtener datos del empleado móvil |
| `GET` | `/api/movil/sync/dispositivos/:empleadoId` | ❌ Pública | Verificar dispositivos del empleado |
| `POST` | `/api/movil/sync/asistencias` | ✅ Bearer | Sincronizar asistencias offline |
| `POST` | `/api/movil/sync/sesiones` | ✅ Bearer | Sincronizar sesiones |

#### Otros Módulos

| Prefijo | Descripción |
|---------|-------------|
| `/api/departamentos` | CRUD de departamentos |
| `/api/tolerancias` | Configuración de tolerancias de retardo |
| `/api/incidencias` | Gestión de incidencias laborales |
| `/api/configuracion` | Configuración global de la empresa |
| `/api/configuraciones-escritorio` | Config específica de dispositivos kiosko |
| `/api/empresas` | CRUD de empresas (multi-tenant, solo SaaS/Admin) |
| `/api/credenciales` | Gestión de credenciales biométricas faciales |
| `/api/modulos` | Catálogo de módulos del sistema |
| `/api/dias-festivos` | Gestión de días festivos |
| `/api/avisos` | Avisos/comunicados del sistema |
| `/api/eventos` | Log de eventos del sistema |
| `/api/stream` | SSE stream general |
| `/api/super-administradores` | CRUD de propietarios SaaS |
| `/api/saas` | Endpoint raíz SaaS |

### 6.5 Ejemplo de Request/Response: Registrar Asistencia

**Request:**
```bash
curl -X POST http://localhost:3002/api/asistencias/registrar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "FAS-EMP-00000000000000000000000000000001",
    "ip": "192.168.1.100",
    "coordenadas": { "lat": 20.6597, "lng": -103.3496 },
    "wifi": { "ssid": "Empresa-WiFi", "bssid": "aa:bb:cc:dd:ee:ff" }
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Asistencia registrada correctamente",
  "data": {
    "id": "FAS-ASI-00000000000000000000000000000042",
    "tipo": "entrada",
    "estado": "puntual",
    "fecha_registro": "2026-05-06T08:02:00.000Z",
    "minutos_tarde": 2,
    "empleado": "Juan Pérez García",
    "advertencias": []
  }
}
```

**Response con advertencia de red (200 OK):**
```json
{
  "success": true,
  "message": "Asistencia registrada con advertencias",
  "data": {
    "id": "FAS-ASI-00000000000000000000000000000043",
    "tipo": "entrada",
    "estado": "retardo_a",
    "advertencias": [
      {
        "tipo": "red_fuera_segmento",
        "severidad": "alta",
        "mensaje": "La IP 10.0.0.5 no pertenece a ningún segmento de red autorizado",
        "detalle": { "ip": "10.0.0.5", "segmentos_configurados": ["192.168.1.0/24"] }
      }
    ]
  }
}
```

### 6.6 Códigos de Estado HTTP

| Código | Significado en FASITLAC |
|--------|------------------------|
| `200` | Operación exitosa |
| `201` | Recurso creado correctamente |
| `400` | Request inválido (validación Zod o JSON malformado) |
| `401` | Sin token o token inválido/expirado |
| `403` | Autenticado pero sin permisos suficientes |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor (logueado en BD) |


---

## 7. Seguridad

### 7.1 Modelo de Autenticación

El sistema implementa un modelo de autenticación **multi-nivel** con tres capas de verificación:

```
Capa 1: Identificación del tipo de actor
  ├── Token SaaS  → saas_<id>  → Consulta a tabla super_administradores
  ├── JWT válido  → jwt.verify() → Roles extraídos del payload
  └── userId raw  → Consulta a tablas usuarios o escritorio (legacy)

Capa 2: Verificación de estado
  └── estado_cuenta = 'activo' en BD (forzado en cada request)

Capa 3: Permisos granulares
  └── permisos_bitwise OR de todos los roles del usuario
```

### 7.2 Gestión de Tokens JWT

```javascript
// Verificación en auth.middleware.js
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
userId = decoded.sub;
```

> **⚠️ CRÍTICO:** En producción, `JWT_SECRET` debe ser una cadena aleatoria de al menos 256 bits. Nunca usar el valor por defecto `'default_secret'`.

**Tokens de dispositivos:** Se generan con expiración de 6 meses y contienen:
```json
{
  "sub": "<dispositivo_id>",
  "empresa_id": "<empresa_id>",
  "roles": ["Kiosko"],
  "permisos": "1",
  "iat": 1234567890,
  "exp": 1250000000
}
```

### 7.3 Jerarquía de Acceso Completa

```
Nivel 0: Propietario SaaS    → empresa_id = 'MASTER' → acceso total
Nivel 1: Administrador       → esAdmin = true → acceso total a su empresa
Nivel 2: Usuario con roles   → permisos bitwise combinados (OR)
Nivel 3: Empleado (self)     → puede acceder a sus propios recursos
Nivel 4: Dispositivo Kiosko  → permisos = '1' (mínimo)
```

### 7.4 Aislamiento Multi-Tenant

El middleware `verificarEmpresa` inyecta `req.empresa_id` en cada request. **Todos los controladores** filtran sus queries con esta variable:

```javascript
// Ejemplo de consulta con aislamiento de tenant
const result = await pool.query(
    'SELECT * FROM empleados WHERE empresa_id = $1',
    [req.empresa_id]  // Siempre filtrado por empresa
);
```

Los administradores pueden cambiar de contexto enviando el header:
```
X-Empresa-Id: <empresa_id_destino>
```

### 7.5 Hashing de Contraseñas

Se usa **bcrypt** con factor de costo por defecto:
```javascript
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 10); // 10 rondas
const esValido = await bcrypt.compare(password, hashGuardado);
```

### 7.6 Protección contra Vulnerabilidades OWASP

| Vulnerabilidad | Mitigación Implementada |
|----------------|------------------------|
| **SQL Injection** | Queries parametrizados en todas las consultas PostgreSQL (`$1`, `$2`, ...) |
| **XSS** | API JSON pura; sin renderizado HTML del lado servidor |
| **CSRF** | No aplica (API REST sin cookies de sesión) |
| **Broken Auth** | Verificación de estado de cuenta en cada request; tokens verificados por JWT |
| **Sensitive Data** | Contraseñas hasheadas con bcrypt; `error.stack` solo en development |
| **Security Misconfiguration** | Variables de entorno separadas; CORS configurable |
| **Inyección** | Validación de entrada con Zod en endpoints críticos |
| **Insecure Direct Object Reference** | `requirePermisoOrSelf`: verificación de ownership o permiso explícito |

### 7.7 Configuración CORS

```javascript
app.use(cors({
    origin: "*",           // ⚠️ En producción, restringir a dominios específicos
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

> **⚠️ PRODUCCIÓN:** Cambiar `origin: "*"` a `origin: ["https://tudominio.com"]`

### 7.8 Límites de Payload

```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

El límite de 10MB es necesario para soportar imágenes base64 de credenciales biométricas.

### 7.9 Auditoría y Logging de Seguridad

Todos los errores no controlados se persisten en la tabla `system_logs`:
```javascript
await logSystemEvent({
    nivel: LOG_LEVELS.ERROR,
    mensaje: err.message,
    contexto: { stack, body, query, params, method },
    ruta: req.originalUrl,
    empresa_id: req.empresa_id
});
```

---

## 8. Integración con Sistemas Externos

### 8.1 PostgreSQL (pg node-postgres)

- **Propósito:** Base de datos principal
- **Protocolo:** TCP (driver nativo node-postgres)
- **Pool:** Conexiones reutilizables con `idleTimeoutMillis: 30000` y `keepAlive: true`
- **Manejo de errores:** El pool captura errores en clientes idle para evitar crash del proceso

### 8.2 Gmail / SMTP (nodemailer)

- **Propósito:** Notificaciones por correo (nuevo admin, credenciales, etc.)
- **Protocolo:** SMTP con TLS (servicio Google)
- **Autenticación:** App Password de Gmail (no contraseña principal)
- **Credenciales:** `EMAIL_USER` y `EMAIL_PASS` en variables de entorno
- **Retry policy:** Sin reintentos automáticos (fallo silencioso, no afecta flujo principal)

**Plantilla de correo enviada al crear un administrador:**
- HTML responsive con branding FASITLAC
- Incluye el identificador de empresa para vincular dispositivos
- Formato profesional con fuente Outfit (Google Fonts)

### 8.3 TensorFlow.js + face-api.js

- **Propósito:** Reconocimiento facial para autenticación biométrica
- **Backend:** CPU puro (`@tensorflow/tfjs-backend-cpu`) — sin GPU requerida
- **Modelos:** Cargados desde `public/models/` en disco local
- **Formato de entrada:** Buffer de imagen (JPEG/PNG)
- **Formato de salida:** `Float32Array` de 128 dimensiones (descriptor facial)
- **Comparación:** Distancia euclidiana entre descriptores (implementada en controlador)
- **Threshold:** Configurable; valor típico `≤ 0.5` para coincidencia

---

## 9. Instalación y Despliegue

### 9.1 Instalación Local (Desarrollo)

```bash
# 1. Clonar el repositorio
git clone <repositorio-url>
cd api-checador

# 2. Instalar dependencias
npm install
# o con pnpm (recomendado, hay pnpm-lock.yaml)
pnpm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con los valores correctos

# 4. Iniciar PostgreSQL y crear la base de datos
psql -U postgres -c "CREATE DATABASE \"checador-fas\";"

# 5. Ejecutar migraciones (si existen scripts)
node scripts/migration_horarios_asistencias.js

# 6. (Opcional) Copiar modelos de face-api al directorio público
# Los modelos de @vladmandic/face-api deben ubicarse en:
mkdir -p public/models
# Copiar: tiny_face_detector_model-*, face_landmark_68_model-*, face_recognition_model-*

# 7. Iniciar en modo desarrollo
npm run dev
# Salida esperada:
# ─────────────────────────────────────────────
# 🖥️  SERVIDOR CHECADOR
# ─────────────────────────────────────────────
# 📦 development
# 🛠️  http://localhost:3002
# 🕓 6/5/2026, 19:00:00
```

### 9.2 Scripts Disponibles

```bash
npm start          # Producción: node src/server.js
npm run dev        # Desarrollo: nodemon src/server.js (hot-reload)
```

### 9.3 Verificación de Instalación

```bash
# Health check
curl http://localhost:3002/
# Respuesta esperada:
# {"status":"OK","service":"CHECADOR","version":"2.0","message":"Respuesta obtenida correctamente."}
```

### 9.4 Despliegue en Producción (Linux)

```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar e instalar
git clone <repo> /opt/fasitlac-api
cd /opt/fasitlac-api
npm install --production

# Configurar variables de entorno
cp .env.example /opt/fasitlac-api/.env
nano /opt/fasitlac-api/.env
# Cambiar NODE_ENV=production

# Instalar y configurar PM2 (gestor de procesos)
npm install -g pm2
pm2 start src/server.js --name "fasitlac-api" --node-args="--experimental-specifier-resolution=node"
pm2 save
pm2 startup  # Autostart en reinicio del servidor

# Verificar estado
pm2 status
pm2 logs fasitlac-api
```

### 9.5 Variables de Entorno en Producción

```bash
# /opt/fasitlac-api/.env (producción)
PORT=3002
NODE_ENV=production
DB_HOST=tu-servidor-postgres.com
DB_USER=fasitlac_user
DB_PASSWORD=contraseña_muy_segura_de_produccion
DB_NAME=checador-produccion
DB_PORT=5432
JWT_SECRET=genera_con_openssl_rand_hex_64
BIOMETRIC_SERVICE_KEY=otra_clave_larga_aleatoria
EMAIL_USER=notificaciones@tuempresa.com
EMAIL_PASS=app_password_gmail
LOG_LEVEL=warn
```

```bash
# Generar JWT_SECRET seguro
openssl rand -hex 64
```

### 9.6 Configuración de Nginx como Proxy Inverso

```nginx
# /etc/nginx/sites-available/fasitlac-api
server {
    listen 80;
    server_name api.tuempresa.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tuempresa.com;

    ssl_certificate /etc/letsencrypt/live/api.tuempresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tuempresa.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # Necesario para SSE (Server-Sent Events)
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
```

### 9.7 Dockerfile (Opcional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias nativas para canvas
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Exponer puerto
EXPOSE 3002

# Variables de entorno (sobreescribir en docker run o docker-compose)
ENV NODE_ENV=production
ENV PORT=3002

CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3002:3002"
    env_file:
      - .env
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: checador-fas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password_seguro
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 9.8 Procedimiento de Rollback

```bash
# Con PM2
pm2 stop fasitlac-api
git checkout <tag-version-anterior>
npm install --production
pm2 start fasitlac-api

# Verificar que el servicio responde
curl http://localhost:3002/
```


---

## 10. Configuración y Personalización

### 10.1 Archivos de Configuración

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `.env` | Raíz del proyecto | Variables de entorno sensibles |
| `src/config/db.js` | Código fuente | Configuración del pool PostgreSQL |
| `src/config/constants.js` | Código fuente | Constantes HTTP_STATUS |
| `src/utils/permissions.js` | Código fuente | Definición del catálogo de permisos |

### 10.2 Parámetros Configurables en Base de Datos

| Tabla | Columna | Tipo | Descripción |
|-------|---------|------|-------------|
| `configuraciones` | `requiere_salida` | boolean | Habilitar detección de salidas no cumplidas |
| `configuraciones` | `segmentos_red` | jsonb | Array de CIDRs permitidos ej. `["192.168.1.0/24"]` |
| `configuraciones` | `tolerancia_id` | string | Referencia a reglas de tolerancia |
| `configuraciones` | `intervalo_bloques_minutos` | integer | Gap mínimo entre turnos para fusión de bloques |
| `tolerancias` | `minutos_retardo` | integer | Minutos de tolerancia base (default: 10) |
| `tolerancias` | `minutos_retardo_a_max` | integer | Límite Retardo A (default: 20) |
| `tolerancias` | `minutos_retardo_b_max` | integer | Límite Retardo B (default: 29) |
| `tolerancias` | `minutos_falta` | integer | A partir de estos minutos es falta (default: 30) |
| `tolerancias` | `minutos_posterior_salida` | integer | Minutos extra permitidos después de salida |
| `tolerancias` | `equivalencia_retardo_a` | integer | Retardos A que equivalen a 1 falta (default: 10) |
| `tolerancias` | `equivalencia_retardo_b` | integer | Retardos B que equivalen a 1 falta (default: 5) |
| `empresas` | `motor_asistencias` | string | Motor de reglas: `dinamico` o `tecnm_art80` |
| `empresas` | `prefijo` | string | Prefijo 3 chars para IDs generados (ej. `FAS`) |

### 10.3 Motor de Reglas Configurable

Para cambiar el motor de asistencias de una empresa:
```sql
UPDATE empresas SET motor_asistencias = 'tecnm_art80' WHERE id = '<empresa_id>';
-- Opciones: 'dinamico' (default) | 'tecnm_art80'
```

### 10.4 Feature Flags

| Flag | Dónde se controla | Descripción |
|------|------------------|-------------|
| Validación de red | `configuraciones.segmentos_red` | Si está vacío, no se valida red |
| Requerir salida | `configuraciones.requiere_salida` | Activa el cron de salidas no cumplidas |
| Reconocimiento facial | Modelos en `public/models/` | Si no hay modelos, el login biométrico falla |
| Logs de producción | `NODE_ENV=production` | Cambia formato de log a JSON, desactiva stack en respuestas |

---

## 11. Mantenimiento

### 11.1 Sistema de Logs

**Archivo:** `logs/error.log`
**Niveles:** `error`, `warn`, `info`, `debug` (configurable vía `LOG_LEVEL`)

**Formato en desarrollo (consola):**
```
2026-05-06 19:00:00 info: ✅ Conectado a la base de datos PostgreSQL
2026-05-06 19:01:00 error: ❌ Error conectando a la base de datos: ...
```

**Formato en producción (JSON en archivo):**
```json
{"level":"error","message":"Error XYZ","timestamp":"2026-05-06 19:00:00"}
```

**Logs persistidos en BD (`system_logs`):**
- Todos los errores 500 se guardan con contexto completo
- Accesibles desde el dashboard SaaS

### 11.2 Monitoreo

**Comandos de diagnóstico con PM2:**
```bash
pm2 status                    # Estado de todos los procesos
pm2 logs fasitlac-api --lines 100  # Últimas 100 líneas de log
pm2 monit                     # Monitor en tiempo real (CPU/RAM)
pm2 restart fasitlac-api      # Reiniciar servicio
```

**Métricas a monitorear:**
- Tiempo de respuesta promedio (objetivo: < 200ms)
- Tasa de errores 5xx (objetivo: < 0.1%)
- Uso de memoria Node.js (alerta: > 1.5 GB con TensorFlow)
- Conexiones activas al pool PostgreSQL

### 11.3 Tareas Programadas (Cron Jobs)

| Job | Expresión Cron | Zona Horaria | Acción |
|-----|----------------|--------------|--------|
| `faltasCron` | `59 23 * * *` | America/Mexico_City | Registra faltas automáticas del día |
| `salidasCron` | `*/15 * * * *` | America/Mexico_City | Detecta salidas no cumplidas |

**Verificar que los cron jobs iniciaron:**
```bash
# En los logs del servidor al iniciar:
# [CRON FALTAS] Programado: todos los días a las 23:59 (America/Mexico_City)
# [CRON SALIDAS] Programado: cada 15 minutos (America/Mexico_City)
```

### 11.4 Script de Limpieza de Base de Datos

```bash
# Limpiar tablas de datos temporales
node scripts/cleanup_db.js

# O ejecutar directamente el SQL de tablas estáticas
psql -U postgres -d checador-fas -f scripts/cleanup_static_tables.sql
```

### 11.5 Actualización de Dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias de seguridad
npm audit fix

# Actualizar dependencias (con precaución)
npm update

# Después de actualizar, siempre probar:
npm run dev
curl http://localhost:3002/  # Health check
```

### 11.6 Migración de Base de Datos

```bash
# Migrar permisos bitwise (si se modifica el catálogo de permisos)
node scripts/migrate_permissions.js

# Migrar estructura de horarios y asistencias
node scripts/migration_horarios_asistencias.js
```

---

## 12. Solución de Problemas

### 12.1 Tabla de Problemas Comunes

| Síntoma | Causa Probable | Solución |
|---------|---------------|----------|
| `Error connectando a la base de datos` | Credenciales DB incorrectas o PostgreSQL caído | Verificar `.env` y estado de PostgreSQL |
| `Error en verificarAutenticacion` | JWT_SECRET diferente entre reinicios | Configurar JWT_SECRET fijo en producción |
| `No se pudieron cargar los modelos de Face API` | Modelos no copiados a `public/models/` | Copiar archivos de modelo de face-api |
| `ECONNRESET` o `idle client timeout` | Caída de conexión BD por inactividad | Ya resuelto por `keepAlive: true` en pool |
| Cron de faltas no registra | Empleados sin horario asignado, o es fin de semana | Verificar `horario_id` en tabla `empleados` |
| SSE desconecta constantemente | Proxy sin soporte de streaming | Agregar `proxy_buffering off` en Nginx |
| Token SaaS rechazado | `saas_<id>` con ID incorrecto o cuenta inactiva | Verificar en tabla `super_administradores` |
| Permisos bitwise incorrectos | Migración no ejecutada tras cambio de catálogo | Ejecutar `node scripts/migrate_permissions.js` |
| Alta latencia en biometría | TensorFlow inicializando modelos por primera vez | Normal en el primer request; modelos se cachean |
| `BigInt` no se serializa a JSON | Uso directo de `JSON.stringify` con BigInt | Usar `.toString()` antes de serializar |

### 12.2 Debugging Paso a Paso

**Problema: 401 en endpoint protegido**
```bash
# 1. Verificar que el token se envía correctamente
curl -v -H "Authorization: Bearer <token>" http://localhost:3002/api/auth/verificar

# 2. Decodificar el JWT (sin verificar firma)
echo "<token_parte_payload>" | base64 -d

# 3. Verificar que el usuario existe y está activo
psql -U postgres -d checador-fas -c "SELECT id, estado_cuenta FROM usuarios WHERE id = '<userId>';"
```

**Problema: 403 a pesar de tener el rol correcto**
```bash
# Verificar permisos del usuario
psql -U postgres -d checador-fas -c "
  SELECT r.nombre, r.permisos_bitwise, r.es_admin
  FROM roles r
  INNER JOIN usuarios_roles ur ON ur.rol_id = r.id
  WHERE ur.usuario_id = '<userId>' AND ur.es_activo = true;
"
```

**Problema: Cron de faltas no ejecuta**
```bash
# Verificar timezone del servidor
timedatectl
# Verificar manualmente ejecutando la función:
node -e "import('./src/jobs/faltasCron.js').then(m => m.iniciarCronFaltas())"
```

### 12.3 Comandos Útiles de Diagnóstico

```bash
# Ver logs de error en tiempo real
tail -f logs/error.log

# Verificar estado del pool de conexiones PostgreSQL
psql -U postgres -d checador-fas -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'checador-fas';"

# Contar asistencias registradas hoy
psql -U postgres -d checador-fas -c "SELECT count(*) FROM asistencias WHERE DATE(fecha_registro) = CURRENT_DATE;"

# Verificar últimos errores en system_logs
psql -U postgres -d checador-fas -c "SELECT nivel, mensaje, ruta, created_at FROM system_logs ORDER BY created_at DESC LIMIT 20;"

# Test de conectividad a la API
curl -w "\n%{http_code} - %{time_total}s\n" http://localhost:3002/
```

### 12.4 FAQs Técnicas

**¿Por qué los IDs tienen un prefijo de empresa variable?**  
Porque el sistema es multi-tenant. El contexto de empresa (`empresa_prefijo`) se propaga mediante `AsyncLocalStorage` y se antepone a todos los IDs generados para facilitar trazabilidad y separación de datos.

**¿Cómo funciona la autenticación legacy (userId directo)?**  
Por compatibilidad con versiones anteriores. Si el token no puede verificarse como JWT válido, se trata como un `userId` directo y se busca en la tabla `usuarios`. Esto permite migración gradual sin romper clientes existentes.

**¿Qué pasa si el cron de faltas falla para un empleado?**  
Cada empleado se procesa de forma independiente dentro de un `try/catch`. Un fallo individual no detiene el procesamiento de los demás. El error se registra con Winston incluyendo el `empleado_id`.

**¿Cómo agregar un nuevo permiso al sistema?**  
1. Agregar la entrada en `CATALOGO_PERMISOS` en `utils/permissions.js` (siguiente bit disponible)
2. Si hay roles existentes que deban tener este permiso, ejecutar script de migración
3. Actualizar `permisosPorModulo` en `permissions.middleware.js` si aplica
4. Usar `requirePermiso('NUEVO_PERMISO')` en las rutas que lo requieran

---

## 13. Desarrollo y Contribución

### 13.1 Estándares de Código

- **Módulos:** ESModules nativos (`import`/`export`), NO CommonJS (`require`)
- **Async:** Siempre `async/await`, nunca callbacks anidados
- **Errores:** Usar `express-async-errors` para propagación automática
- **Respuestas:** Usar siempre `sendSuccess()` y `sendError()` de `utils/response.js`
- **IDs:** Siempre generar con `generateId(ID_PREFIXES.ENTIDAD)` de `utils/idGenerator.js`
- **Logging:** Usar `logger.info/error/warn()` de `utils/logger.js`, no `console.log` directo
- **Queries:** Siempre parametrizadas (`$1`, `$2`), nunca interpolación de strings SQL

### 13.2 Estructura de un Controlador Nuevo

```javascript
// src/controllers/nuevo.controller.js
import { pool } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generateId, ID_PREFIXES } from '../utils/idGenerator.js';
import logger from '../utils/logger.js';

export async function createNuevo(req, res) {
    const { nombre } = req.body;
    const empresa_id = req.empresa_id;

    if (!nombre) {
        return sendError(res, 'El campo nombre es requerido', 400);
    }

    const id = await generateId(ID_PREFIXES.NUEVO_PREFIJO);
    await pool.query(
        'INSERT INTO nueva_tabla (id, nombre, empresa_id) VALUES ($1, $2, $3)',
        [id, nombre, empresa_id]
    );

    logger.info(`Nuevo recurso creado: ${id}`);
    return sendSuccess(res, { id, nombre }, 'Creado correctamente', 201);
}
```

### 13.3 Estructura de una Ruta Nueva

```javascript
// src/routes/nuevo.routes.js
import { Router } from 'express';
import { createNuevo, getNuevo } from '../controllers/nuevo.controller.js';
import { verificarAutenticacion } from '../middleware/auth.middleware.js';
import { verificarEmpresa } from '../middleware/tenant.middleware.js';
import { requirePermiso } from '../middleware/permissions.middleware.js';

const router = Router();

router.use(verificarAutenticacion);
router.use(verificarEmpresa);

router.get('/', requirePermiso('PERMISO_VER'), getNuevo);
router.post('/', requirePermiso('PERMISO_CREAR'), createNuevo);

export default router;
```

Registrar en `src/app.js`:
```javascript
import nuevoRoutes from './routes/nuevo.routes.js';
app.use('/api/nuevo', nuevoRoutes);
```

### 13.4 Flujo de Git

```bash
# Crear rama de feature
git checkout -b feature/nombre-del-feature

# Commits descriptivos
git commit -m "feat: agregar endpoint de exportación de nómina"
git commit -m "fix: corregir clasificación de retardo cuando el turno es nocturno"
git commit -m "refactor: extraer lógica de geofencing a networkValidator"

# Pull request hacia main
git push origin feature/nombre-del-feature
```

**Prefijos de commit:**
- `feat:` — nueva funcionalidad
- `fix:` — corrección de bug
- `refactor:` — refactorización sin cambio de comportamiento
- `docs:` — documentación
- `chore:` — tareas de mantenimiento (deps, scripts)

### 13.5 Testing

Actualmente el proyecto no incluye framework de testing configurado. Se recomienda:

```bash
# Instalar Jest o Vitest para ESM
npm install -D vitest

# Estructura recomendada de tests
src/
├── __tests__/
│   ├── utils/
│   │   ├── asistenciaClassifier.test.js
│   │   ├── networkValidator.test.js
│   │   └── idGenerator.test.js
│   └── middleware/
│       └── auth.middleware.test.js
```

**Ejemplo de test unitario para el clasificador:**
```javascript
import { describe, it, expect } from 'vitest';
import { clasificarMinutos } from '../utils/asistenciaClassifier.js';

describe('clasificarMinutos', () => {
    const tolerancia = { minutos_retardo: 10, minutos_retardo_a_max: 20, minutos_retardo_b_max: 29 };

    it('clasifica como puntual si llega dentro de la tolerancia', () => {
        expect(clasificarMinutos(5, tolerancia)).toBe('puntual');
        expect(clasificarMinutos(-10, tolerancia)).toBe('puntual'); // llegó antes
    });

    it('clasifica como retardo_a entre 11 y 20 minutos', () => {
        expect(clasificarMinutos(15, tolerancia)).toBe('retardo_a');
    });

    it('clasifica como falta si supera 29 minutos', () => {
        expect(clasificarMinutos(30, tolerancia)).toBe('falta');
    });
});
```

---

## 14. Anexos

### 14.1 Diagrama de Secuencia: Login y Primer Request Autenticado

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API (Express)
    participant DB as PostgreSQL

    C->>A: POST /api/auth/login {usuario, password}
    A->>DB: SELECT usuario WHERE username = ?
    DB-->>A: row (hash, estado, empresa_id)
    A->>A: bcrypt.compare(password, hash)
    A->>DB: SELECT roles, permisos_bitwise WHERE usuario_id = ?
    DB-->>A: roles[]
    A->>A: Combinar permisos con OR bitwise
    A-->>C: {success: true, token, usuario, permisos}

    Note over C,A: Request autenticado posterior

    C->>A: GET /api/empleados (Authorization: Bearer token)
    A->>A: verificarAutenticacion → jwt.verify(token)
    A->>DB: SELECT usuario WHERE id = userId AND estado='activo'
    DB-->>A: usuario row
    A->>A: verificarEmpresa → req.empresa_id = empresa_id
    A->>A: requirePermiso('USUARIO_VER') → tienePermiso(bits, 0)
    A->>DB: SELECT * FROM empleados WHERE empresa_id = ?
    DB-->>A: empleados[]
    A-->>C: {success: true, data: empleados[]}
```

### 14.2 Diagrama de Flujo: Registro de Asistencia con Validaciones

```mermaid
flowchart TD
    A([POST /api/asistencias/registrar]) --> B{¿Autenticado?}
    B -->|No| X1[401 No autenticado]
    B -->|Sí| C[Cargar config empresa]
    C --> D[Ejecutar validaciones de red]
    D --> D1{CIDR válido?}
    D1 -->|No| W1[Agregar advertencia: red_fuera_segmento]
    D1 -->|Sí| D2{GPS en geocerca?}
    W1 --> D2
    D2 -->|No| W2[Agregar advertencia: gps_fuera_zona]
    D2 -->|Sí| E[Obtener asistencias del día]
    W2 --> E
    E --> F{¿Tiene entrada sin salida?}
    F -->|No| G1[Tipo = entrada]
    F -->|Sí| G2[Tipo = salida]
    G1 --> H[Obtener horario del empleado]
    H --> I[Calcular minutos tarde]
    I --> J[Clasificar: puntual/retardo_a/retardo_b/falta]
    G2 --> K[Estado = salida]
    J --> L[INSERT asistencias + eventos]
    K --> L
    L --> M[Broadcast SSE]
    M --> N([200 OK con estado y advertencias])
```

### 14.3 Catálogo de Tablas de Base de Datos (Inferidas)

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Cuentas de usuario del sistema |
| `empleados` | Perfil laboral (RFC, NSS, horario) |
| `roles` | Definición de roles con permisos bitwise |
| `usuarios_roles` | Asignación N:M usuario-rol |
| `empresas` | Empresas del sistema (tenants) |
| `departamentos` | Departamentos de cada empresa |
| `empleados_departamentos` | Asignación N:M empleado-departamento |
| `horarios` | Configuración JSON de turnos |
| `tolerancias` | Parámetros de clasificación de asistencias |
| `configuraciones` | Configuración global de cada empresa |
| `asistencias` | Registros de entrada/salida/falta |
| `incidencias` | Incidencias laborales (permisos, etc.) |
| `solicitudes` | Solicitudes de afiliación de dispositivos |
| `escritorio` | Dispositivos kiosko registrados |
| `movil` | Dispositivos móviles registrados |
| `biometrico` | Terminales biométricas |
| `credenciales` | Descriptores faciales de empleados |
| `eventos` | Log de eventos de negocio |
| `system_logs` | Log técnico persistido del servidor |
| `dias_festivos` | Catálogo de días festivos por empresa |
| `avisos` | Comunicados y avisos del sistema |
| `super_administradores` | Propietarios del sistema SaaS |
| Secuencias (`seq_*`) | 22 secuencias PostgreSQL para generación de IDs |

### 14.4 Grupos de Permisos Predefinidos

```javascript
// Para asignación rápida al crear roles
import { GRUPOS_PERMISOS } from './src/utils/permissions.js';

GRUPOS_PERMISOS.ADMIN_ESTANDAR  // Todos los 39 permisos activados
GRUPOS_PERMISOS.EMPLEADO_BASICO // Solo REGISTRO_VER (bit 31)
GRUPOS_PERMISOS.SUPERVISOR      // VER usuarios, registros, reportes + gestión incidencias
```

### 14.5 Changelog del Sistema

| Versión | Cambios Principales |
|---------|-------------------|
| **2.0** | Multi-tenant por `empresa_id`; permisos bitwise con BigInt (64 bits); motor de reglas intercambiable; reconocimiento facial TensorFlow.js; SSE para tiempo real; sincronización offline escritorio/móvil; jerarquía de configuración; IDs con prefijo empresa |
| **1.x** | Sistema original con permisos simples; base de datos mono-empresa |

### 14.6 Referencias y Recursos

- [Express.js Docs](https://expressjs.com/en/4x/api.html)
- [node-postgres (pg) Docs](https://node-postgres.com/)
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken)
- [@vladmandic/face-api](https://github.com/vladmandic/face-api)
- [TensorFlow.js para Node](https://www.tensorflow.org/js/guide/nodejs)
- [node-cron Docs](https://www.npmjs.com/package/node-cron)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Zod Validation](https://zod.dev/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL 14 Docs](https://www.postgresql.org/docs/14/)

---

*Documento generado el 6 de mayo de 2026 — FASITLAC Sistema de Control de Asistencia v2.0*
