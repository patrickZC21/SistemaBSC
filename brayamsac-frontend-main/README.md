# 🏢 Frontend Web - Sistema de Asistencias Brayam SAC

### Versión Final — Diciembre 2025

Frontend web del sistema de gestión de asistencias para roles de administración: RRHH, administradores y coordinadores. Permite gestionar almacenes, subalmacenes, trabajadores, coordinadores, registrar asistencias y visualizar dashboards analíticos.

## 🚀 Tecnologías

- **React 19** - Framework frontend
- **Vite 6** - Build tool y dev server
- **TailwindCSS** - Framework CSS
- **React Router 7** - Enrutamiento
- **Chart.js / Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconografía

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
# → http://localhost:5173
```

## ⚙️ Variables de Entorno

El proyecto usa un único archivo `.env`:

```env
# URL del backend
VITE_API_URL=http://localhost:3000
```

## 📱 Páginas y Funcionalidades

| Página | Ruta | Descripción |
|--------|------|-------------|
| Login | `/loginSistema` | Inicio de sesión con correo y contraseña |
| Dashboard | `/dashboard` | Panel analítico con métricas en tiempo real |
| Almacenes | `/almacenes` | Gestión de almacenes y subalmacenes |
| Coordinadores | `/coordinadores` | Gestión de coordinadores y asignación de almacenes |
| RRHH | `/rrhh` | Panel de recursos humanos |
| Trabajadores | `/trabajadores` | Gestión de trabajadores |
| Asistencias | `/asistencias/:subalmacenId/:fecha` | Registro de asistencias por fecha |

### Dashboard Analítico
El dashboard incluye:
- **Tarjetas de resumen**: Almacenes, subalmacenes, coordinadores, trabajadores
- **Métricas con datos reales**:
  - Tasa de Asistencia (presentes hoy vs total)
  - Duración Promedio (horas por trabajador, últimos 7 días)
  - Tasa de Cumplimiento (horas trabajadas vs objetivo)
- **Rankings**: Horas extras y horas faltantes por trabajador
- **Tabla de trabajadores** de la semana

## 📁 Estructura del Proyecto

```
brayamsac-frontend-main/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── charts/         # Gráficos (MetricsPanel, etc.)
│   │   ├── features/       # Componentes por funcionalidad
│   │   └── layout/         # Layout (Sidebar, etc.)
│   ├── pages/              # Páginas principales
│   ├── hooks/              # Custom hooks
│   ├── services/           # Servicios de API
│   ├── utils/              # Utilidades y helpers
│   └── config/             # Configuración (api.js, security.js)
├── public/                 # Archivos estáticos
├── .env                    # Variables de entorno
├── vite.config.js          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind
├── eslint.config.js        # Configuración de ESLint
├── package.json
└── README.md
```

## 🔒 Seguridad

- **Token JWT en localStorage** - Persiste al cerrar navegador
- **Sin expiración por tiempo** - Token válido hasta logout manual
- **Validación periódica** - Verifica token cada 30 segundos (`useTokenExpiration`)
- **Sesión única** - Solo 1 sesión activa por usuario
- **CORS** - Solo acepta requests del backend configurado

## 🔧 Scripts

```bash
npm run dev              # Desarrollo con hot-reload
npm run build            # Build de producción
npm run preview          # Vista previa del build
npm run lint             # Revisar código con ESLint
```

## 🚀 Despliegue

```bash
# Build para producción
npm run build
# Los archivos quedan en dist/
```

## 👨‍💻 Autor

**Patrick Zamata**

---
**Última actualización:** Diciembre 2025
