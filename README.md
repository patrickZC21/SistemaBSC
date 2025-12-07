# 🏢 Sistema de Control de Asistencias - BRAYAM SAC

### Versión Final — Diciembre 2025

---

## 📋 Descripción

Sistema integral de control de asistencias para la empresa Brayam SAC. Permite gestionar almacenes, subalmacenes, coordinadores, trabajadores y el registro diario de asistencias con visualización analítica en tiempo real.

El sistema está compuesto por tres módulos:

| Módulo | Carpeta | Descripción |
|--------|---------|-------------|
| **Backend API** | `brayamsac-backend-main/` | API REST con Node.js, Express 5 y MySQL 8.4 |
| **Frontend Web** | `brayamsac-frontend-main/` | Panel web para RRHH y administradores (React 19 + Vite) |
| **App Móvil** | `frontend-App/` | Aplicación Android para coordinadores en campo (React + Capacitor) |

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────┐     ┌─────────────────────┐
│   Frontend Web      │     │   App Móvil Android  │
│   (React 19 + Vite) │     │  (React + Capacitor) │
│   Puerto: 5173      │     │   Puerto: 5174       │
└────────┬────────────┘     └────────┬─────────────┘
         │                           │
         └─────────┬─────────────────┘
                   │ HTTP / REST
         ┌─────────▼─────────────────┐
         │      Backend API          │
         │  (Node.js + Express 5)    │
         │      Puerto: 3000         │
         └─────────┬─────────────────┘
                   │ MySQL
         ┌─────────▼─────────────────┐
         │    Base de Datos          │
         │   MySQL 8.4 (AWS RDS)    │
         └───────────────────────────┘
```

## 👥 Roles del Sistema

| Rol | Plataforma | Permisos |
|-----|-----------|----------|
| **Administrador** | Web | Acceso total: gestión de usuarios, almacenes, reportes |
| **RRHH** | Web | Dashboard, gestión de trabajadores, exportación de reportes |
| **Coordinador** | Web + App Móvil | Registro de asistencias en subalmacenes asignados |

## ✨ Funcionalidades Principales

### Panel Web (RRHH / Admin)
- 📊 **Dashboard analítico** con métricas en tiempo real
  - Tasa de asistencia diaria
  - Duración promedio de jornada
  - Tasa de cumplimiento de horas objetivo
  - Rankings de horas extras y faltantes
- 🏪 **Gestión de almacenes y subalmacenes**
- 👷 **Gestión de trabajadores** (CRUD completo)
- 👥 **Gestión de coordinadores** y asignación a almacenes
- ✅ **Registro y edición de asistencias** (hora entrada, hora salida, justificación)
- 📥 **Exportación a Excel** de registros de asistencia
- 🔔 **Notificaciones en tiempo real** (Server-Sent Events)

### App Móvil (Coordinadores)
- 📱 **Interfaz optimizada** para uso en campo
- ✅ **Registro rápido de asistencias** por subalmacén y fecha
- 🔄 **Sincronización en tiempo real** con el backend

## 🛠️ Requisitos

- **Node.js 18+**
- **npm**
- **MySQL 8.0+** (o acceso a instancia AWS RDS)
- **Android Studio** (solo para compilar APK de la app móvil)

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/patrickZC21/SistemaBSC.git
cd SistemaBSC
```

### 2. Backend
```bash
cd brayamsac-backend-main
npm install

# Crear archivo .env con las credenciales de BD
# (ver brayamsac-backend-main/README.md para detalle de variables)

npm run dev
# → http://localhost:3000
```

### 3. Frontend Web
```bash
cd brayamsac-frontend-main
npm install

# Crear archivo .env
# VITE_API_URL=http://localhost:3000

npm run dev
# → http://localhost:5173
```

### 4. App Móvil (opcional)
```bash
cd frontend-App
npm install

# Crear archivo .env
# VITE_API_URL=http://localhost:3000

npm run dev
# → http://localhost:5174

# Para generar APK: ver frontend-App/README.md
```

## 🔒 Seguridad

- **JWT sin expiración por tiempo** — el token solo se invalida al cerrar sesión
- **Sesión única por usuario** — no permite login simultáneo en múltiples dispositivos
- **bcrypt** para encriptación de contraseñas
- **Rate limiting** contra ataques de fuerza bruta
- **Helmet** para headers de seguridad (CSP, X-Frame-Options, etc.)
- **CORS** configurado para orígenes permitidos
- **Prepared statements** contra SQL injection

## 📁 Estructura del Repositorio

```
SistemaBSC/
├── brayamsac-backend-main/       # Backend API
│   ├── src/
│   │   ├── config/               # Configuración (BD, Swagger)
│   │   ├── controllers/          # Controladores (auth, dashboard, etc.)
│   │   ├── middlewares/          # Auth, seguridad, validación
│   │   ├── routes/               # Rutas de la API
│   │   ├── services/             # Lógica de negocio
│   │   ├── utils/                # Logger, helpers
│   │   └── index.js              # Punto de entrada
│   ├── package.json
│   └── README.md
│
├── brayamsac-frontend-main/      # Frontend Web
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   ├── pages/                # Páginas (Dashboard, Almacenes, etc.)
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # Servicios de API
│   │   └── config/               # Configuración
│   ├── package.json
│   └── README.md
│
├── frontend-App/                 # App Móvil Android
│   ├── src/                      # Código React
│   ├── android/                  # Proyecto Android (Capacitor)
│   ├── capacitor.config.json
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md                     # Este archivo
```

## ⚙️ Variables de Entorno

Cada módulo usa su propio archivo `.env` (no incluido en el repositorio por seguridad):

| Módulo | Variable principal | Ejemplo |
|--------|-------------------|---------|
| Backend | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` | Ver `brayamsac-backend-main/README.md` |
| Frontend Web | `VITE_API_URL` | `http://localhost:3000` |
| App Móvil | `VITE_API_URL` | `http://localhost:3000` |

## 📊 Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime | Node.js | 22 |
| Backend | Express | 5.1 |
| Base de datos | MySQL | 8.4 |
| Frontend | React | 19 |
| Build tool | Vite | 6 |
| Estilos | TailwindCSS | 4 |
| Gráficos | Chart.js / Recharts | 4 / 3 |
| Móvil nativo | Capacitor | 7 |
| Autenticación | JWT (jsonwebtoken) | — |
| Documentación API | Swagger | — |

## 👨‍💻 Autor

**Patrick Zamata**

---

> **Versión Final** · Sistema de Control de Asistencias · BRAYAM SAC · Diciembre 2025
