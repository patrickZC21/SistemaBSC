import { buildApiUrl, apiRequest, logger, apiCache } from '../config/app-security.js';

// Cache keys para trabajadores
const CACHE_KEYS = {
  trabajador: (id) => `trabajador_${id}`,
  todosTrabajadores: 'todos_trabajadores',
  trabajadoresBatch: (ids) => `trabajadores_batch_${ids.sort().join('_')}`
};

// Tiempo de cache en milisegundos
const CACHE_TIME = {
  trabajador: 15 * 60 * 1000, // 15 minutos para trabajador individual
  todosTrabajadores: 10 * 60 * 1000, // 10 minutos para todos los trabajadores
  batch: 10 * 60 * 1000 // 10 minutos para lotes
};

// Set para rastrear peticiones en progreso y evitar duplicados
const requestsInProgress = new Set();

/**
 * Obtener trabajador por ID con cache optimizado
 */
export async function getTrabajadorPorIdOptimized(id) {
  if (!id) return null;
  
  const cacheKey = CACHE_KEYS.trabajador(id);
  const requestKey = `trabajador_${id}`;
  
  // Verificar cache primero
  const cached = apiCache.get(cacheKey);
  if (cached) {
    logger.log('Trabajador obtenido del cache:', id);
    return cached;
  }
  
  // Evitar peticiones duplicadas
  if (requestsInProgress.has(requestKey)) {
    logger.log('Petición de trabajador ya en progreso:', id);
    // Esperar un poco y verificar cache nuevamente
    await new Promise(resolve => setTimeout(resolve, 100));
    return apiCache.get(cacheKey) || null;
  }
  
  try {
    requestsInProgress.add(requestKey);
    
    const url = buildApiUrl(`/api/trabajadores/${id}`);
    const data = await apiRequest(url);
    
    if (data) {
      // Cachear el resultado
      apiCache.set(cacheKey, data, CACHE_TIME.trabajador);
      logger.log('Trabajador cargado y cacheado:', id);
    }
    
    return data;
  } catch (error) {
    logger.error('Error al obtener trabajador:', id, error);
    return null;
  } finally {
    requestsInProgress.delete(requestKey);
  }
}

/**
 * Obtener múltiples trabajadores de forma optimizada
 */
export async function getTrabajadoresBatch(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  
  const uniqueIds = [...new Set(ids.filter(id => id))];
  const batchKey = CACHE_KEYS.trabajadoresBatch(uniqueIds);
  
  // Verificar cache del lote completo
  const cachedBatch = apiCache.get(batchKey);
  if (cachedBatch) {
    logger.log('Lote de trabajadores obtenido del cache:', uniqueIds.length);
    return cachedBatch;
  }
  
  // Verificar cache individual y determinar qué IDs necesitan ser cargados
  const result = {};
  const idsToFetch = [];
  
  for (const id of uniqueIds) {
    const cached = apiCache.get(CACHE_KEYS.trabajador(id));
    if (cached) {
      result[id] = cached;
    } else {
      idsToFetch.push(id);
    }
  }
  
  // Cargar solo los trabajadores que no están en cache
  if (idsToFetch.length > 0) {
    logger.log('Cargando trabajadores no cacheados:', idsToFetch.length, 'de', uniqueIds.length);
    
    const promises = idsToFetch.map(id => getTrabajadorPorIdOptimized(id));
    const results = await Promise.all(promises);
    
    results.forEach((trabajador, index) => {
      if (trabajador) {
        const id = idsToFetch[index];
        result[id] = trabajador;
      }
    });
  } else {
    logger.log('Todos los trabajadores del lote obtenidos del cache');
  }
  
  // Convertir a array manteniendo el orden original
  const orderedResult = uniqueIds.map(id => result[id]).filter(Boolean);
  
  // Cachear el lote completo
  apiCache.set(batchKey, orderedResult, CACHE_TIME.batch);
  
  return orderedResult;
}

/**
 * Obtener todos los trabajadores con cache optimizado
 */
export async function getTodosTrabajadoresOptimized() {
  const cacheKey = CACHE_KEYS.todosTrabajadores;
  const requestKey = 'todos_trabajadores';
  
  // Verificar cache
  const cached = apiCache.get(cacheKey);
  if (cached) {
    logger.log('Todos los trabajadores obtenidos del cache:', cached.length);
    return cached;
  }
  
  // Evitar peticiones duplicadas
  if (requestsInProgress.has(requestKey)) {
    logger.log('Petición de todos los trabajadores ya en progreso');
    await new Promise(resolve => setTimeout(resolve, 200));
    return apiCache.get(cacheKey) || [];
  }
  
  try {
    requestsInProgress.add(requestKey);
    
    const url = buildApiUrl('/api/trabajadores');
    const data = await apiRequest(url);
    
    if (Array.isArray(data)) {
      // Cachear el resultado principal
      apiCache.set(cacheKey, data, CACHE_TIME.todosTrabajadores);
      
      // También cachear cada trabajador individualmente
      data.forEach(trabajador => {
        if (trabajador && trabajador.id) {
          apiCache.set(CACHE_KEYS.trabajador(trabajador.id), trabajador, CACHE_TIME.trabajador);
        }
      });
      
      logger.log('Todos los trabajadores cargados y cacheados:', data.length);
      return data;
    }
    
    return [];
  } catch (error) {
    logger.error('Error al obtener todos los trabajadores:', error);
    return [];
  } finally {
    requestsInProgress.delete(requestKey);
  }
}

/**
 * Limpiar cache de trabajadores
 */
export function clearTrabajadoresCache() {
  // Limpiar cache principal
  apiCache.delete(CACHE_KEYS.todosTrabajadores);
  
  // Limpiar cache individual (esto es más complejo, pero podemos limpiar por patrón)
  const keys = apiCache.keys();
  keys.forEach(key => {
    if (key.startsWith('trabajador_') || key.startsWith('trabajadores_batch_')) {
      apiCache.delete(key);
    }
  });
  
  logger.log('Cache de trabajadores limpiado');
}

/**
 * Invalidar cache de un trabajador específico
 */
export function invalidateTrabajadorCache(id) {
  if (!id) return;
  
  apiCache.delete(CACHE_KEYS.trabajador(id));
  // También limpiar cache de lotes que puedan contener este trabajador
  const keys = apiCache.keys();
  keys.forEach(key => {
    if (key.startsWith('trabajadores_batch_') && key.includes(`_${id}_`)) {
      apiCache.delete(key);
    }
  });
  
  logger.log('Cache invalidado para trabajador:', id);
}

/**
 * Precargar trabajadores más utilizados
 */
export async function preloadTrabajadoresComunes(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  
  const idsToPreload = ids.filter(id => !apiCache.get(CACHE_KEYS.trabajador(id)));
  
  if (idsToPreload.length > 0) {
    logger.log('Precargando trabajadores comunes:', idsToPreload.length);
    await getTrabajadoresBatch(idsToPreload);
  }
}