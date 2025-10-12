// Sistema de rate limiting para el frontend
class RateLimiter {
  constructor() {
    this.requests = new Map(); // endpoint -> array de timestamps
    this.limits = {
      '/api/auth/validar': { maxRequests: 10, windowMs: 60000 }, // 10 requests por minuto
      '/api/asistencias': { maxRequests: 30, windowMs: 60000 }, // 30 requests por minuto
      '/api/subalmacenes': { maxRequests: 20, windowMs: 60000 }, // 20 requests por minuto
      '/api/almacenes': { maxRequests: 20, windowMs: 60000 }, // 20 requests por minuto
      'default': { maxRequests: 50, windowMs: 60000 } // límite por defecto
    };
  }

  // Obtener la configuración de límite para un endpoint
  getLimitConfig(endpoint) {
    // Buscar configuración específica
    for (const [pattern, config] of Object.entries(this.limits)) {
      if (pattern !== 'default' && endpoint.includes(pattern)) {
        return config;
      }
    }
    return this.limits.default;
  }

  // Verificar si se puede hacer la petición
  canMakeRequest(endpoint) {
    const now = Date.now();
    const config = this.getLimitConfig(endpoint);
    
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, []);
    }

    const requestTimes = this.requests.get(endpoint);
    
    // Limpiar requests antiguos
    const validRequests = requestTimes.filter(time => now - time < config.windowMs);
    this.requests.set(endpoint, validRequests);

    // Verificar si se puede hacer la petición
    if (validRequests.length >= config.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = config.windowMs - (now - oldestRequest);
      
      console.warn(`[RateLimiter] Límite alcanzado para ${endpoint}. Esperar ${Math.ceil(waitTime / 1000)}s`);
      return { allowed: false, waitTime };
    }

    return { allowed: true, waitTime: 0 };
  }

  // Registrar una petición
  recordRequest(endpoint) {
    const now = Date.now();
    
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, []);
    }

    const requestTimes = this.requests.get(endpoint);
    requestTimes.push(now);
    
    // Mantener solo los requests recientes
    const config = this.getLimitConfig(endpoint);
    const validRequests = requestTimes.filter(time => now - time < config.windowMs);
    this.requests.set(endpoint, validRequests);

    console.log(`[RateLimiter] Request registrado para ${endpoint}. Total: ${validRequests.length}/${config.maxRequests}`);
  }

  // Obtener estadísticas de uso
  getStats() {
    const stats = {};
    const now = Date.now();

    for (const [endpoint, requestTimes] of this.requests.entries()) {
      const config = this.getLimitConfig(endpoint);
      const validRequests = requestTimes.filter(time => now - time < config.windowMs);
      
      stats[endpoint] = {
        current: validRequests.length,
        limit: config.maxRequests,
        windowMs: config.windowMs,
        usage: `${validRequests.length}/${config.maxRequests}`
      };
    }

    return stats;
  }

  // Limpiar estadísticas
  clear() {
    this.requests.clear();
    console.log('[RateLimiter] Estadísticas limpiadas');
  }

  // Esperar hasta que se pueda hacer una petición
  async waitForSlot(endpoint) {
    const check = this.canMakeRequest(endpoint);
    
    if (check.allowed) {
      return true;
    }

    console.log(`[RateLimiter] Esperando ${Math.ceil(check.waitTime / 1000)}s para ${endpoint}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.waitForSlot(endpoint));
      }, Math.min(check.waitTime, 5000)); // Máximo 5 segundos de espera
    });
  }
}

// Instancia global del rate limiter
const rateLimiter = new RateLimiter();

// Wrapper para fetch con rate limiting
export const rateLimitedFetch = async (url, options = {}) => {
  const endpoint = new URL(url).pathname;
  
  // Verificar rate limit
  const canProceed = await rateLimiter.waitForSlot(endpoint);
  
  if (!canProceed) {
    throw new Error(`Rate limit exceeded for ${endpoint}`);
  }

  // Registrar la petición
  rateLimiter.recordRequest(endpoint);

  // Hacer la petición
  try {
    const response = await fetch(url, options);
    
    // Si recibimos 429, actualizar el rate limiter
    if (response.status === 429) {
      console.warn(`[RateLimiter] Servidor devolvió 429 para ${endpoint}`);
      // Agregar penalización temporal
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(endpoint);
      }
    }
    
    return response;
  } catch (error) {
    console.error(`[RateLimiter] Error en petición a ${endpoint}:`, error.message);
    throw error;
  }
};

// Exportar instancia y utilidades
export { rateLimiter };

// Hook para obtener estadísticas en componentes React
export const useRateLimiterStats = () => {
  return rateLimiter.getStats();
};

// Función para mostrar estadísticas en consola (debugging)
export const logRateLimiterStats = () => {
  const stats = rateLimiter.getStats();
  console.table(stats);
};