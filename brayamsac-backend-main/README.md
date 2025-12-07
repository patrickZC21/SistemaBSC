# 🏢 Sistema de Control de Asistencias - Backend

### Versión Final — Diciembre 2025

Backend del sistema de control de asistencias de Brayam SAC. API REST desarrollada con Node.js y Express 5 que gestiona usuarios, trabajadores, asistencias, almacenes y reportes. Conectado a base de datos MySQL 8.4 en AWS RDS.

## 🚀 Tecnologías

- **Node.js 22** - Runtime
- **Express 5.1** - Framework web
- **MySQL 8.4** - Base de datos (AWS RDS)
- **JWT** - Autenticación sin expiración por tiempo
- **bcrypt** - Encriptación de contraseñas
- **Helmet** - Headers de seguridad
- **Swagger** - Documentación API

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo (con hot-reload)
npm run dev

# Ejecutar en producción
npm start
```

## ⚙️ Variables de Entorno

El proyecto usa un único archivo `.env` en la raíz:

```env
# Base de datos AWS RDS
DB_HOST=tu-host-rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=tu_contraseña
DB_NAME=brayamsacasistencia_control_asistencias

# JWT (sin expiración - solo se invalida al hacer logout)
JWT_SECRET=tu_jwt_secret_seguro

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Sesiones
SESSION_SECRET=tu_session_secret
```

## 📖 API Endpoints

### Documentación Swagger
```
http://localhost:3000/api-docs
```

### Health Check
| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Estado del servidor |
| `GET /ping-db` | Conexión a base de datos |
| `GET /health` | Health check completo (uptime, memoria, BD) |

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/login` | Iniciar sesión |
| POST | `/logout` | Cerrar sesión (invalida token) |
| GET | `/validar` | Validar token activo |
| POST | `/force-logout` | Forzar cierre de sesión por correo |

### 👥 Usuarios (`/api/usuarios`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar usuarios |
| POST | `/` | Crear usuario |
| PUT | `/:id` | Actualizar usuario |
| DELETE | `/:id` | Eliminar usuario |

### 👷 Trabajadores (`/api/trabajadores`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar trabajadores |
| POST | `/` | Crear trabajador |
| PUT | `/:id` | Actualizar trabajador |
| DELETE | `/:id` | Eliminar trabajador |

### ✅ Asistencias (`/api/asistencias`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar asistencias (con filtros) |
| POST | `/` | Registrar asistencia |
| PUT | `/:id` | Actualizar asistencia |
| DELETE | `/:id` | Eliminar asistencia |

### 🏪 Almacenes y Subalmacenes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/almacenes` | Listar almacenes |
| POST | `/api/almacenes` | Crear almacén |
| GET | `/api/subalmacenes` | Listar subalmacenes |
| POST | `/api/subalmacenes` | Crear subalmacén |

### 📊 Dashboard (`/api/dashboard`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/resumen` | Conteos generales (almacenes, trabajadores, etc.) |
| GET | `/trabajadores-semana` | Trabajadores activos últimos 7 días |
| GET | `/horas-extras` | Ranking de horas extras (30 días) |
| GET | `/horas-faltantes` | Ranking de horas faltantes |
| GET | `/metricas-tarjetas` | Métricas de tarjetas: asistencia, duración, cumplimiento |

### 📥 Exportación (`/api/exportar`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/fechas-excel` | Exportar asistencias a Excel |
| GET | `/asistencias/trabajador/:id` | Exportar por trabajador |

## 📁 Estructura del Proyecto

```
brayamsac-backend-main/
├── src/
│   ├── config/              # Configuración (DB, Swagger)
│   ├── controllers/         # Controladores por módulo
│   │   ├── auth.controller.js
│   │   └── dashboard/       # Controladores del dashboard
│   ├── middleware/           # Middleware de errores de BD
│   ├── middlewares/          # Auth, seguridad, validación
│   ├── routes/              # Definición de rutas
│   ├── services/            # Lógica de negocio
│   │   └── dashboard/       # Servicios del dashboard
│   ├── utils/               # Utilidades (logger, password helper)
│   └── index.js             # Punto de entrada
├── scripts/                 # Scripts de base de datos
├── tests/                   # Tests de integración
├── .env                     # Variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Seguridad

- **JWT sin expiración por tiempo** - Token válido hasta que el usuario cierre sesión
- **Control de sesión única** - Solo 1 sesión activa por usuario (`ya_ingreso`)
- **bcrypt** - Encriptación de contraseñas
- **Rate limiting** - Protección contra fuerza bruta
- **Helmet** - Headers de seguridad (CSP, X-Frame-Options, etc.)
- **CORS** - Orígenes permitidos configurables
- **Prepared statements** - Protección contra SQL injection
- **Sanitización** - Validación y limpieza de inputs

## 🔧 Scripts

```bash
npm run dev              # Desarrollo con nodemon
npm start                # Producción
npm run db:check         # Verificar usuarios en BD
npm run db:analyze       # Análisis completo de BD
npm run db:encrypt       # Encriptar contraseñas
npm run security:audit   # Auditoría de seguridad
```

## 🚀 Despliegue

```bash
# Producción
NODE_ENV=production node src/index.js
```

## 👨‍💻 Autor

**Patrick Zamata**

---
**Última actualización:** Diciembre 2025
