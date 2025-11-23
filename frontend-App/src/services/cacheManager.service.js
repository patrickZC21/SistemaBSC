import { apiCache, logger } from '../config/app-security.js';

/**
 * Servicio centralizado para gestión de cache
 * Coordina todas las optimizaciones de la aplicación
 */
class CacheManager {
  constructor() {
    this.cacheKeys = {
      USER: 'current_user',
      SUBALMACENES: 'subalmacenes_list',
      TRABAJADORES: 'trabajadores_all',
      ASISTENCIAS: 'asistencias_',
      SUBALMACEN_FECHAS: 'subalmacen_fechas_'
    };
    
    this.cacheTimes = {
      USER: 5 * 60 * 1000,        // 5 minutos
      SUBALMACENES: 10 * 60 * 1000, // 10 minutos
      TRABAJADORES: 15 * 60 * 1000, // 15 minutos
      ASISTENCIAS: 3 * 60 * 1000,   // 3 minutos
      SUBALMACEN_FECHAS: 15 * 60 * 1000 // 15 minutos
    };
  }

  /**
   * Obtener datos del cache si están vigentes
   */
  get(key, maxAge = null) {
    const cachedData = apiCache.get(key);
    if (!cachedData) return null;
    
    const age = maxAge || this.getCacheTime(key);
    if (cachedData.timestamp && Date.now() - cachedData.timestamp > age) {
      this.delete(key);
      return null;
    }
    
    return cachedData.data;
  }

  /**
   * Guardar datos en cache con timestamp
   */
  set(key, data, customTime = null) {
    apiCache.set(key, {
      data,
      timestamp: Date.now(),
      cacheTime: customTime || this.getCacheTime(key)
    });
    
    logger.log(`Cache actualizado: ${key}`);
  }

  /**
   * Eliminar entrada específica del cache
   */
  delete(key) {
    apiCache.delete(key);
    logger.log(`Cache eliminado: ${key}`);
  }

  /**
   * Obtener tiempo de cache para una clave
   */
  getCacheTime(key) {
    for (const [type, time] of Object.entries(this.cacheTimes)) {
      if (key.includes(this.cacheKeys[type].toLowerCase())) {
        return time;
      }
    }
    return 5 * 60 * 1000; // Default 5 minutos
  }

  /**
   * Limpiar cache por tipo
   */
  clearByType(type) {
    const prefix = this.cacheKeys[type.toUpperCase()];
    if (!prefix) return;
    
    const keys = apiCache.keys();
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        apiCache.delete(key);
        cleared++;
      }
    });
    
    logger.log(`Cache limpiado por tipo ${type}: ${cleared} entradas`);
  }

  /**
   * Limpiar todo el cache
   */
  clearAll() {
    const size = apiCache.size;
    apiCache.clear();
    logger.log(`Cache completamente limpiado: ${size} entradas`);
  }

  /**
   * Limpiar cache expirado
   */
  clearExpired() {
    const keys = apiCache.keys();
    let cleared = 0;
    
    keys.forEach(key => {
      const cachedData = apiCache.get(key);
      if (cachedData && cachedData.timestamp) {
        const age = this.getCacheTime(key);
        if (Date.now() - cachedData.timestamp > age) {
          apiCache.delete(key);
          cleared++;
        }
      }
    });
    
    if (cleared > 0) {
      logger.log(`Cache expirado limpiado: ${cleared} entradas`);
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    const keys = apiCache.keys();
    const stats = {
      total: keys.length,
      byType: {},
      expired: 0
    };
    
    keys.forEach(key => {
      // Contar por tipo
      for (const [type, prefix] of Object.entries(this.cacheKeys)) {
        if (key.startsWith(prefix)) {
          stats.byType[type] = (stats.byType[type] || 0) + 1;
          break;
        }
      }
      
      // Contar expirados
      const cachedData = apiCache.get(key);
      if (cachedData && cachedData.timestamp) {
        const age = this.getCacheTime(key);
        if (Date.now() - cachedData.timestamp > age) {
          stats.expired++;
        }
      }
    });
    
    return stats;
  }

  /**
   * Invalidar cache relacionado con asistencias
   */
  invalidateAsistenciasCache(subalmacenId = null, fecha = null) {
    const keys = apiCache.keys();
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith(this.cacheKeys.ASISTENCIAS)) {
        // Si se especifica subalmacén y fecha, ser más específico
        if (subalmacenId && fecha) {
          if (key.includes(`${subalmacenId}_${fecha}`)) {
            apiCache.delete(key);
            cleared++;
          }
        } else {
          // Limpiar todo el cache de asistencias
          apiCache.delete(key);
          cleared++;
        }
      }
    });
    
    logger.log(`Cache de asistencias invalidado: ${cleared} entradas`);
  }

  /**
   * Precargar datos críticos
   */
  async preloadCriticalData() {
    logger.log('Iniciando precarga de datos críticos...');
    
    try {
      // Aquí se pueden agregar precargas específicas
      // Por ejemplo, subalmacenes, usuario actual, etc.
      
      logger.log('Precarga de datos críticos completada');
    } catch (error) {
      logger.error('Error en precarga de datos críticos:', error);
    }
  }

  /**
   * Configurar limpieza automática del cache
   */
  setupAutoCleaning(intervalMinutes = 30) {
    setInterval(() => {
      this.clearExpired();
    }, intervalMinutes * 60 * 1000);
    
    logger.log(`Auto-limpieza de cache configurada cada ${intervalMinutes} minutos`);
  }
}

// Instancia singleton
const cacheManager = new CacheManager();

// Configurar auto-limpieza al inicializar
cacheManager.setupAutoCleaning(30);

export default cacheManager;

// Exportar funciones específicas para facilidad de uso
export const {
  get: getCachedData,
  set: setCachedData,
  delete: deleteCachedData,
  clearByType,
  clearAll: clearAllCache,
  clearExpired,
  getStats: getCacheStats,
  invalidateAsistenciasCache,
  preloadCriticalData
} = cacheManager;