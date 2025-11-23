# 📱 App Móvil Coordinadores - Asistencias Brayam SAC

### Versión Final — Abril 2026

Aplicación móvil para coordinadores de campo, optimizada para el registro rápido de asistencias desde dispositivos Android. Construida con React + Vite y empaquetada como APK nativa usando Capacitor.

## 👥 Usuarios

- **Coordinadores de almacén** en terreno
- Uso exclusivo en **dispositivos móviles/tablets**

## 🚀 Tecnologías

- **React 18** - Framework frontend
- **Vite** - Build tool
- **Capacitor** - Bridge nativo para Android
- **TailwindCSS** - Estilos responsive
- **Lucide React** - Iconografía

## 📱 Flujo de la App

```
Login → Dashboard → Subalmacenes → Fechas → Registro de Asistencias
```

| Página | Ruta | Descripción |
|--------|------|-------------|
| Login | `/` | Inicio de sesión del coordinador |
| Dashboard | `/dashboard` | Navegación principal |
| Subalmacenes | `/subalmacenes` | Subalmacenes asignados al coordinador |
| Fechas | `/subalmacenes/:id/fechas` | Fechas de asistencia programadas |
| Asistencias | `/asistencias/:subalmacenId/:fecha` | Registro de entrada/salida |

## 🛠️ Desarrollo Local

### Prerrequisitos
- Node.js 18+
- Backend corriendo en puerto 3000
- Android Studio (para compilar APK)

### Instalación
```bash
cd frontend-App
npm install
npm run dev
# → http://localhost:5174
```

## ⚙️ Variables de Entorno

El proyecto usa un único archivo `.env`:

```env
# URL del backend
VITE_API_URL=http://localhost:3000

# Configuración de la app
VITE_APP_TYPE=mobile
VITE_APP_NAME=AsistenciasApp Mobile
VITE_PORT=5174

# Rendimiento
VITE_REQUEST_TIMEOUT=30000
VITE_CACHE_ENABLED=true
VITE_CACHE_DURATION=300000
VITE_LOG_LEVEL=error

# Configuración móvil
VITE_DEV_TOOLS=false
VITE_MOBILE_OPTIMIZED=true
```

## 📦 Generar APK

```bash
# 1. Build del frontend
npm run build

# 2. Sincronizar con Capacitor
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android

# 4. En Android Studio: Build → Build Bundle/APK → Build APK
```

### Configuración Capacitor
El archivo `capacitor.config.json` contiene:
- **appId**: Identificador único de la app
- **appName**: Nombre mostrado en el dispositivo
- **webDir**: `dist` (carpeta de build)

## 📁 Estructura del Proyecto

```
frontend-App/
├── src/                    # Código fuente React
│   ├── components/         # Componentes reutilizables
│   ├── pages/              # Páginas de la app
│   ├── hooks/              # Custom hooks
│   ├── config/             # Configuración (API, seguridad)
│   └── services/           # Servicios de API
├── android/                # Proyecto Android nativo (Capacitor)
├── dist/                   # Build compilado (para Capacitor)
├── public/                 # Archivos estáticos
├── capacitor.config.json   # Configuración de Capacitor
├── .env                    # Variables de entorno
├── vite.config.js          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind
├── package.json
└── README.md
```

## 🔑 Diferencias con el Frontend Web

| Característica | App Móvil | Frontend Web |
|---------------|-----------|--------------|
| **Audiencia** | Solo coordinadores | Admin, RRHH, Coordinadores |
| **Plataforma** | Android (APK) | Navegador web |
| **Diseño** | Mobile-first | Desktop-first |
| **Funcionalidad** | Solo registro de asistencias | Sistema completo (dashboard, gestión, reportes) |
| **Puerto dev** | 5174 | 5173 |

## 👨‍💻 Autor

**Patrick Zamata**

---
**Última actualización:** Abril 2026
