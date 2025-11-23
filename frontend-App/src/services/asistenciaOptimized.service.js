import { buildApiUrl, tokenManager, logger, validators, apiRequest, apiCache } from '../config/app-security.js';

// Cache keys para asistencias
const CACHE_KEYS = {
  asistenciasPorFecha: (subalmacenId, fecha) => `asistencias_${subalmacenId}_${fecha}`,
  asistencia: (id) => `asistencia_${id}`
};

// Tiempo de cache en milisegundos
const CACHE_TIME = {
  asistencias: 3 * 60 * 1000, // 3 minutos para asistencias (datos más dinámicos)
  asistencia: 5 * 60 * 1000   // 5 minutos para asistencia individual
};

// Set para rastrear peticiones en progreso
const requestsInProgress = new Set();

// Mapa para rastrear la última actualización por fecha/subalmacén
const lastUpdateTime = new Map();

/**
 * Crear nueva asistencia (optimizada)
 */
export async function crearAsistenciaOptimized(data) {
  const url = buildApiUrl('/api/asistencias');
  const result = await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  // Invalidar cache relacionado después de crear
  if (result && data.subalmacen_id && data.programacion_fecha_id) {
    // Necesitamos la fecha real, pero por ahora invalidamos el patrón
    const keys = apiCache.keys();
    keys.forEach(key => {
      if (key.startsWith(`asistencias_${data.subalmacen_id}_`)) {
        apiCache.delete(key);
      }
    });
    logger.log('Cache de asistencias invalidado después de crear');
  }
  
  return result;
}

/**
 * Obtener asistencias por fecha con cache optimizado y throttling
 */
export async function getAsistenciasPorFechaOptimized(subalmacenId, fecha, options = {}) {
  const { forceRefresh = false, useCache = true } = options;
  
  if (!validators.isValidId(subalmacenId) || !fecha) {
    return [];
  }
  
  const cacheKey = CACHE_KEYS.asistenciasPorFecha(subalmacenId, fecha);
  const requestKey = `asistencias_${subalmacenId}_${fecha}`;
  const updateKey = `${subalmacenId}_${fecha}`;
  
  logger.log('getAsistenciasPorFechaOptimized llamado:', { subalmacenId, fecha, forceRefresh, useCache });
  
  // Verificar cache si no se fuerza refresh
  if (useCache && !forceRefresh) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      logger.log('Asistencias obtenidas del cache:', cached.length);
      return cached;
    }
  }
  
  // Throttling: evitar peticiones muy frecuentes (mínimo 2 segundos)
  const now = Date.now();
  const lastUpdate = lastUpdateTime.get(updateKey) || 0;
  if (now - lastUpdate < 2000 && !forceRefresh) {
    logger.log('Petición muy frecuente, usando cache o datos actuales');
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;
  }
  
  // Evitar peticiones duplicadas
  if (requestsInProgress.has(requestKey)) {
    logger.log('Petición de asistencias ya en progreso:', requestKey);
    // Esperar un poco y verificar cache
    await new Promise(resolve => setTimeout(resolve, 200));
    const cached = apiCache.get(cacheKey);
    return cached || [];
  }
  
  try {
    requestsInProgress.add(requestKey);
    lastUpdateTime.set(updateKey, now);
    
    // Si se fuerza refresh, limpiar cache primero
    if (forceRefresh) {
      apiCache.delete(cacheKey);
    }
    
    const url = buildApiUrl('/api/asistencias', {
      subalmacen_id: subalmacenId,
      fecha: fecha
    });
    
    const data = await apiRequest(url);
    const result = data || [];
    
    // Cachear el resultado
    if (useCache) {
      apiCache.set(cacheKey, result, CACHE_TIME.asistencias);
    }
    
    logger.log('Asistencias cargadas del servidor:', result.length);
    return result;
    
  } catch (error) {
    logger.error('Error al obtener asistencias:', error);
    // En caso de error, intentar devolver datos del cache si existen
    const cached = apiCache.get(cacheKey);
    if (cached) {
      logger.log('Devolviendo datos del cache debido a error');
      return cached;
    }
    return [];
  } finally {
    requestsInProgress.delete(requestKey);
  }
}

/**
 * Actualizar asistencia optimizada
 */
export async function updateAsistenciaOptimized(id, data) {
  if (!validators.isValidId(id)) {
    throw new Error('ID de asistencia inválido');
  }
  
  // Filtrar solo campos válidos y no vacíos (lógica original)
  const validData = {};
  
  if (typeof data.hora_entrada !== 'undefined') {
    validData.hora_entrada = validators.isValidTimeFormat(data.hora_entrada) 
      ? data.hora_entrada 
      : (data.hora_entrada === '' ? null : undefined);
  }
  
  if (typeof data.hora_salida !== 'undefined') {
    validData.hora_salida = validators.isValidTimeFormat(data.hora_salida) 
      ? data.hora_salida 
      : (data.hora_salida === '' ? null : undefined);
  }
  
  if (typeof data.justificacion !== 'undefined') {
    validData.justificacion = data.justificacion;
  }
  
  if (typeof data.estado !== 'undefined') {
    validData.estado = data.estado;
  }
  
  // Eliminar los undefined
  Object.keys(validData).forEach(k => validData[k] === undefined && delete validData[k]);
  
  if (Object.keys(validData).length === 0) {
    throw new Error('No hay datos válidos para actualizar');
  }
  
  const url = buildApiUrl(`/api/asistencias/${id}`);
  const result = await apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(validData)
  });
  
  // Invalidar cache relacionado después de actualizar
  if (result) {
    // Invalidar cache de asistencia individual
    apiCache.delete(CACHE_KEYS.asistencia(id));
    
    // Invalidar cache de listas de asistencias que puedan contener esta asistencia
    const keys = apiCache.keys();
    keys.forEach(key => {
      if (key.startsWith('asistencias_')) {
        apiCache.delete(key);
      }
    });
    
    logger.log('Cache invalidado después de actualizar asistencia:', id);
  }
  
  return result;
}

/**
 * Obtener asistencia individual optimizada
 */
export async function getAsistenciaOptimized(id) {
  if (!validators.isValidId(id)) {
    return null;
  }
  
  const cacheKey = CACHE_KEYS.asistencia(id);
  const requestKey = `asistencia_${id}`;
  
  // Verificar cache
  const cached = apiCache.get(cacheKey);
  if (cached) {
    logger.log('Asistencia obtenida del cache:', id);
    return cached;
  }
  
  // Evitar peticiones duplicadas
  if (requestsInProgress.has(requestKey)) {
    logger.log('Petición de asistencia ya en progreso:', id);
    await new Promise(resolve => setTimeout(resolve, 100));
    return apiCache.get(cacheKey) || null;
  }
  
  try {
    requestsInProgress.add(requestKey);
    
    const url = buildApiUrl(`/api/asistencias/${id}`);
    const data = await apiRequest(url);
    
    if (data) {
      apiCache.set(cacheKey, data, CACHE_TIME.asistencia);
      logger.log('Asistencia cargada y cacheada:', id);
    }
    
    return data;
  } catch (error) {
    logger.error('Error al obtener asistencia:', id, error);
    return null;
  } finally {
    requestsInProgress.delete(requestKey);
  }
}

/**
 * Limpiar cache de asistencias
 */
export function clearAsistenciasCache(subalmacenId = null, fecha = null) {
  if (subalmacenId && fecha) {
    // Limpiar cache específico
    const cacheKey = CACHE_KEYS.asistenciasPorFecha(subalmacenId, fecha);
    apiCache.delete(cacheKey);
    logger.log('Cache específico de asistencias limpiado:', { subalmacenId, fecha });
  } else {
    // Limpiar todo el cache de asistencias
    const keys = apiCache.keys();
    keys.forEach(key => {
      if (key.startsWith('asistencias_') || key.startsWith('asistencia_')) {
        apiCache.delete(key);
      }
    });
    logger.log('Todo el cache de asistencias limpiado');
  }
}

/**
 * Invalidar cache después de cambios masivos
 */
export function invalidateAsistenciasCache(subalmacenId, fecha) {
  clearAsistenciasCache(subalmacenId, fecha);
  
  // También limpiar el timestamp de última actualización
  const updateKey = `${subalmacenId}_${fecha}`;
  lastUpdateTime.delete(updateKey);
}

/**
 * Precargar asistencias para fechas próximas (opcional)
 */
export async function preloadAsistencias(subalmacenId, fechas) {
  if (!Array.isArray(fechas) || fechas.length === 0) return;
  
  const promises = fechas.map(fecha => {
    const cacheKey = CACHE_KEYS.asistenciasPorFecha(subalmacenId, fecha);
    if (!apiCache.get(cacheKey)) {
      return getAsistenciasPorFechaOptimized(subalmacenId, fecha, { useCache: true });
    }
    return Promise.resolve([]);
  });
  
  try {
    await Promise.all(promises);
    logger.log('Asistencias precargadas para fechas:', fechas.length);
  } catch (error) {
    logger.error('Error al precargar asistencias:', error);
  }
}