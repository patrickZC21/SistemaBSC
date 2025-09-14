// src/index.js

// 📦 Dependencias principales
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ⚙️ Configuración
import pool from './config/db.js';
import { specs, swaggerUi } from './config/swagger.js';
dotenv.config(); // Cargar variables de entorno

// 🧩 Middlewares
import { manejarErrores } from './middlewares/error.middleware.js';
import { helmetConfig } from './middlewares/security.middleware.js';
import { sanitizarInput } from './middlewares/validation.middleware.js';
import { dbErrorHandler, healthCheckEndpoint } from './middleware/dbErrorHandler.js';

// 🚦 Rutas
import authRoutes from './routes/auth.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import trabajadoresRoutes from './routes/trabajadores.routes.js';
import asistenciasRoutes from './routes/asistencias.routes.js';
import fechasRoutes from './routes/fechas.routes.js';
import almacenesRoutes from './routes/almacenes.routes.js';
import subalmacenesRoutes from './routes/subalmacenes.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import exportRoutes from './routes/export.routes.js';
import usuarioAlmacenesRoutes from './routes/usuarioAlmacenes.routes.js';
import trabajadorAsistenciaRoutes from './routes/trabajadorAsistencia.routes.js';
import rotacionRoutes from './routes/rotacion.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
const app = express();

// 🛡️ Middlewares de seguridad - CORS debe ir PRIMERO
app.use(cors({
  origin: function (origin, callback) {
    // Log para debugging
    console.log('🔍 CORS Origin Request:', origin);
    
    // Permitir requests sin origin (apps móviles nativas)
    if (!origin) {
      console.log('✅ CORS: Permitiendo request sin origin (app móvil)');
      return callback(null, true);
    }
    
    // URLs permitidas para aplicaciones web
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      // URLs de desarrollo local
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:3000'
    ].filter(Boolean); // Remover valores undefined/null
    
    console.log('🔧 CORS: URLs permitidas:', allowedOrigins);
    
    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin permitido:', origin);
      return callback(null, true);
    }
    
    // Log de origin no permitido
    console.log('❌ CORS: Origin NO permitido:', origin);
    
    // En producción, ser más estricto
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('No permitido por política CORS'), false);
    }
    
    // En desarrollo, permitir todos los origins
    console.log('⚠️ CORS: Permitiendo en modo desarrollo');
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores legacy
}));
app.use(helmetConfig); // Headers de seguridad (después de CORS)
app.use(express.json({ limit: '10mb' })); // Limitar tamaño del body
app.use(sanitizarInput); // Sanitización de input

// 🧪 Ruta de prueba del servidor
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando. Usa /ping-db para probar la conexión a la base de datos.');
});

// 📖 Documentación API con Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Brayamsac API Documentation',
  customfavIcon: '/favicon.ico'
}));

// 🧪 Verificación conexión BD
app.get('/ping-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS time');
    res.json({ 
      connected: true, 
      time: rows[0].time,
      dbConfig: {
        host: process.env.DB_HOST || 'No configurado',
        port: process.env.DB_PORT || '3306',
        database: process.env.DB_NAME || 'No configurado',
        ssl: 'Habilitado',
        engine: 'MySQL 8.4.7'
      },
      provider: 'AWS RDS',
      region: 'sa-east-1',
      tip: 'Conexión exitosa a la base de datos MySQL en AWS RDS.'
    });
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    res.status(500).json({ 
      connected: false, 
      error: err.message,
      errorCode: err.code,
      dbConfig: {
        host: process.env.DB_HOST || 'No configurado',
        port: process.env.DB_PORT || '3306',
        database: process.env.DB_NAME || 'No configurado',
        ssl: 'Habilitado',
        engine: 'MySQL 8.4.7'
      },
      provider: 'AWS RDS',
      region: 'sa-east-1',
      tip: err.code === 'ECONNREFUSED' ? 
        'No se puede conectar al host. Verifica que el Security Group (sg-053a96b88ab130507) permita conexiones desde tu IP en el puerto 3306.' : 
        err.code === 'ER_ACCESS_DENIED_ERROR' ?
        'Error de acceso denegado. Verifica las credenciales DB_USER (admin) y DB_PASSWORD en el archivo .env.' :
        err.code === 'ETIMEDOUT' ?
        'Tiempo de espera agotado. Verifica que RDS sea accesible públicamente o que tu IP esté en el Security Group.' :
        'Verifica las credenciales y la configuración de la base de datos en AWS RDS Console.'
    });
  }
});

// 🏥 Health check robusto para AWS Load Balancer
app.get('/health', async (req, res) => {
  try {
    // Test database connectivity
    await pool.query('SELECT 1');
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
      }
    };
    
    res.status(200).json(healthCheck);
  } catch (error) {
    const healthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    };
    
    res.status(503).json(healthCheck);
  }
});

// 🔗 Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/fechas', fechasRoutes);
app.use('/api/almacenes', almacenesRoutes);
app.use('/api/subalmacenes', subalmacenesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exportar', exportRoutes);
app.use('/api/usuario-almacenes', usuarioAlmacenesRoutes);
// GET /api/trabajadores/:id/asistencias-personales
app.use('/api/trabajadorAsistencia', trabajadorAsistenciaRoutes);
app.use('/api/rotaciones', rotacionRoutes);
app.use('/api/notifications', notificationsRoutes);

// 🏥 Health check específico para base de datos
app.get('/api/health/database', healthCheckEndpoint);

// 🚨 Middlewares de manejo de errores (deben ir al final)
app.use(dbErrorHandler); // Manejo específico de errores de DB
app.use(manejarErrores); // Manejo general de errores

// 🚀 Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT} | Modo: ${process.env.NODE_ENV || 'development'}`);
});
