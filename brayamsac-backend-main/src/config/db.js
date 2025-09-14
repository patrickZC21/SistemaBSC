import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ES Modules, obtenemos la ruta actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la ruta correcta (subimos 2 directorios)
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

// ⚡ CONFIGURACIÓN OPTIMIZADA PARA AWS RDS MySQL 8.4.7
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT) || (process.env.NODE_ENV === 'production' ? 8 : 5),
  queueLimit: 0,
  charset: 'utf8mb4',
  // Configuraciones de timeout para evitar ERR_ABORTED
  acquireTimeout: 20000, // 20 segundos para obtener conexión
  connectTimeout: 15000, // 15 segundos para conectar
  // Configuraciones adicionales para estabilidad
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  debug: false,
  multipleStatements: false,
  // SSL habilitado para conexiones AWS RDS
  ssl: {
    rejectUnauthorized: false
  }
});

// Test de conexión al iniciar
pool.getConnection()
  .then(connection => {
    console.log(`✅ BD conectada a AWS RDS (${process.env.DB_HOST})`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error BD:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('   💡 Verifica que el Security Group de RDS permita conexiones desde tu IP');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   💡 Verifica las credenciales DB_USER y DB_PASSWORD en .env');
    } else if (err.code === 'ETIMEDOUT') {
      console.error('   💡 Verifica que RDS esté accesible públicamente o que tu IP esté en el Security Group');
    }
  });

export default pool;
