# Changelog - Sistema de Control de Asistencias BRAYAM SAC

## v1.0.0 — Versión Final (Diciembre 2025)
### Sistema completo estabilizado
- feat: métricas de tarjetas del dashboard con datos 100% reales
- feat: token JWT sin expiración por tiempo (solo logout manual)
- fix: limpieza de configuraciones de despliegue obsoletas
- fix: consolidación de variables de entorno en un solo .env por módulo
- docs: README actualizado para los 3 módulos del sistema
- docs: documentación API completa con Swagger

## v0.7.0 — CR-07 (24/11/2025 – 07/12/2025)
### Integración final y despliegue a producción (RF-19)
- feat: sincronización en tiempo real entre app móvil y panel web
- feat: integración completa de todos los módulos del sistema
- fix: correcciones de errores detectados en pruebas internas
- deploy: despliegue controlado a entorno de producción
- docs: documentación técnica y manuales de usuario

## v0.6.0 — CR-06 (10/11/2025 – 23/11/2025)
### App móvil, notificaciones y seguridad (RF-16, RF-17, RF-18)
- feat: aplicación móvil Android con Capacitor para coordinadores
- feat: interfaz mobile-first optimizada para registro en campo
- feat: notificaciones en tiempo real con Server-Sent Events (SSE)
- feat: middlewares de seguridad (Helmet, CSP, CORS)
- feat: headers de seguridad y protección XSS
- deploy: pruebas de integración entre web y móvil

## v0.5.0 — CR-05 (27/10/2025 – 09/11/2025)
### Gestión de coordinadores y permisos avanzados (RF-13, RF-14, RF-15)
- feat: módulo de coordinadores con asignación a almacenes
- feat: sistema de permisos basado en roles (Admin, RRHH, Coordinador)
- feat: panel RRHH con gestión de personal
- feat: validación de sesión única por usuario
- feat: rate limiting y protección contra fuerza bruta
- deploy: primeras pruebas en entorno de producción

## v0.4.0 — CR-04 (13/10/2025 – 26/10/2025)
### Dashboard analítico y exportación de reportes (RF-10, RF-11, RF-12)
- feat: dashboard con tarjetas de resumen (almacenes, trabajadores, coordinadores)
- feat: gráficos de horas extras y horas faltantes con Chart.js
- feat: ranking de trabajadores por rendimiento semanal
- feat: exportación de asistencias a Excel con formato profesional
- feat: API de métricas del dashboard con datos en tiempo real
- test: pruebas internas del módulo de reportes

## v0.3.0 — CR-03 (29/09/2025 – 12/10/2025)
### Registro de asistencias y programación de fechas (RF-07, RF-08, RF-09)
- feat: registro de asistencias con hora de entrada y salida
- feat: programación de fechas por subalmacén
- feat: validación de horarios y justificaciones
- feat: página de login del frontend con autenticación JWT
- feat: navegación con React Router y protección de rutas
- test: pruebas internas de flujo de asistencias

## v0.2.0 — CR-02 (15/09/2025 – 28/09/2025)
### Gestión de trabajadores, almacenes y subalmacenes (RF-04, RF-05, RF-06)
- feat: CRUD completo de trabajadores con validaciones
- feat: gestión de almacenes con asignación de coordinadores
- feat: gestión de subalmacenes vinculados a almacenes
- feat: componentes frontend para listado y formularios de trabajadores

## v0.1.0 — CR-01 (01/09/2025 – 14/09/2025)
### Núcleo base del sistema (RF-01, RF-02, RF-03)
- feat: configuración inicial del proyecto backend (Node.js + Express)
- feat: conexión a base de datos MySQL con connection pooling
- feat: autenticación JWT con login/logout y control de sesión única
- feat: CRUD de usuarios con roles (Admin, RRHH, Coordinador)
- feat: encriptación de contraseñas con bcrypt
- feat: estructura base del frontend React + Vite
