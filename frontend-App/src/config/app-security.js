// Configuración centralizada y segura para la app de asistencias
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AsistenciasApp',
  PORT: import.meta.env.VITE_PORT || 5174,
  
  // Configuraciones móviles
  APP_TYPE: import.meta.env.VITE_APP_TYPE || 'web',
  REQUEST_TIMEOUT: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || 15000,
  CACHE_ENABLED: import.meta.env.VITE_CACHE_ENABLED === 'true',
  CACHE_DURATION: parseInt(import.meta.env.VITE_CACHE_DURATION) || 300000,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  MOBILE_OPTIMIZED: import.meta.env.VITE_MOBILE_OPTIMIZED === 'true',
  
  // Endpoints de la API
  ENDPOINTS: {
    asistencias: '/api/asistencias',
    almacenes: '/api/almacenes',
    subalmacenes: '/api/subalmacenes',
    trabajadores: '/api/trabajadores',
    dashboard: '/api/dashboard',
    auth: '/api/auth'
  }
};

// Helper para construir URLs de API de forma segura
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${APP_CONFIG.API_BASE_URL}${endpoint}`;
  
  // Agregar query parameters si existen
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  return url;
};

// Gestión segura de tokens con persistencia mejorada
export const tokenManager = {
  set: (token) => {
    if (!token || typeof token !== 'string' || !token.trim()) {
      console.warn('Token inválido proporcionado');
      return false;
    }
    try {
      const tokenData = {
        token: token.trim(),
        timestamp: Date.now(),
        persistent: true // Marcar como sesión persistente
      };
      localStorage.setItem('token', token.trim());
      localStorage.setItem('tokenData', JSON.stringify(tokenData));
      return true;
    } catch (error) {
      console.error('Error al guardar token:', error);
      return false;
    }
  },
  
  get: () => {
    try {
      const token = localStorage.getItem('token');
      return token && token.trim() ? token.trim() : null;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  },
  
  remove: () => {
    try {
      // Verificar si estamos en móvil y la sesión debe ser persistente
      const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
      const mobileSessionPersistent = localStorage.getItem('mobileSessionPersistent');
      
      if (isMobile && mobileSessionPersistent === 'true') {
        console.log('🔐 MÓVIL: Evitando eliminación de token - sesión persistente activa');
        return false; // NO eliminar token en móviles con sesión persistente
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('tokenData');
      localStorage.removeItem('sessionPersistent');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('sessionActive');
      localStorage.removeItem('mobileSessionPersistent');
      return true;
    } catch (error) {
      console.error('Error al eliminar token:', error);
      return false;
    }
  },
  
  isValid: () => {
    const token = tokenManager.get();
    if (!token || token.length === 0) return false;
    try {
      // Decode JWT payload (base64) to check expiration
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('🔐 Token JWT expirado');
        return false;
      }
      return true;
    } catch (e) {
      console.error('🔐 Error al decodificar token:', e);
      return false;
    }
  },
  
  // Marcar sesión como persistente (no cerrar automáticamente)
  markSessionPersistent: () => {
    try {
      localStorage.setItem('sessionPersistent', 'true');
      return true;
    } catch (error) {
      console.error('Error al marcar sesión persistente:', error);
      return false;
    }
  },
  
  // Verificar si la sesión debe ser persistente
  isSessionPersistent: () => {
    try {
      const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
      const mobileSessionPersistent = localStorage.getItem('mobileSessionPersistent');
      const webSessionPersistent = localStorage.getItem('sessionPersistent');
      
      // En móviles, siempre persistente si está marcado
      if (isMobile && mobileSessionPersistent === 'true') {
        return true;
      }
      
      // En web, verificar bandera específica
      return webSessionPersistent === 'true';
    } catch (error) {
      return false;
    }
  },
  
  // Forzar eliminación del token (para logout manual)
  forceRemove: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenData');
      localStorage.removeItem('sessionPersistent');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('sessionActive');
      localStorage.removeItem('mobileSessionPersistent');
      console.log('🔐 Token eliminado forzosamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar token forzosamente:', error);
      return false;
    }
  },
  
  // Obtener información de la sesión
  getSessionInfo: () => {
    try {
      const tokenDataStr = localStorage.getItem('tokenData');
      if (tokenDataStr) {
        return JSON.parse(tokenDataStr);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener info de sesión:', error);
      return null;
    }
  },
  
  getAuthHeaders: () => {
    const token = tokenManager.get();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }
};

// Logger que respeta la configuración LOG_LEVEL
export const logger = {
  log: (...args) => {
    if (import.meta.env.DEV && ['debug', 'info', 'log'].includes(APP_CONFIG.LOG_LEVEL)) {
      console.log('[DEV]', ...args);
    }
  },
  
  error: (...args) => {
    if (import.meta.env.DEV || APP_CONFIG.LOG_LEVEL === 'error') {
      console.error(import.meta.env.DEV ? '[DEV]' : '[ERROR]', ...args);
    }
  },
  
  warn: (...args) => {
    if (import.meta.env.DEV && ['debug', 'info', 'warn'].includes(APP_CONFIG.LOG_LEVEL)) {
      console.warn('[DEV]', ...args);
    }
  },
  
  info: (...args) => {
    if (import.meta.env.DEV && ['debug', 'info'].includes(APP_CONFIG.LOG_LEVEL)) {
      console.info('[DEV]', ...args);
    }
  },
  
  debug: (...args) => {
    if (import.meta.env.DEV && APP_CONFIG.LOG_LEVEL === 'debug') {
      console.debug('[DEBUG]', ...args);
    }
  }
};

// Utilidades para validación de datos
export const validators = {
  isValidTimeFormat: (time) => {
    return typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  },
  
  isValidDate: (date) => {
    return date instanceof Date && !isNaN(date.getTime());
  },
  
  isValidId: (id) => {
    return id && (typeof id === 'string' || typeof id === 'number') && String(id).trim() !== '';
  },
  
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  }
};

// Cache simple para optimizar requests repetidos
class SimpleCache {
  constructor(ttl = APP_CONFIG.CACHE_DURATION || 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
    this.enabled = APP_CONFIG.CACHE_ENABLED;
  }
  
  set(key, value) {
    if (!this.enabled) return;
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    if (!this.enabled) return null;
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  keys() {
    if (!this.enabled) return [];
    return Array.from(this.cache.keys());
  }
  
  has(key) {
    if (!this.enabled) return false;
    return this.cache.has(key);
  }
  
  size() {
    if (!this.enabled) return 0;
    return this.cache.size;
  }
  
  clear() {
    this.cache.clear();
  }
  
  delete(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new SimpleCache();

// Helper para requests con manejo de errores mejorado y timeout
export const apiRequest = async (url, options = {}) => {
  try {
    // Detectar si estamos en un entorno móvil (Capacitor)
    const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
    
    if (isMobile && window.Capacitor.Plugins.CapacitorHttp) {
      // Usar CapacitorHttp para aplicaciones móviles
      const { CapacitorHttp } = window.Capacitor.Plugins;
      
      const requestOptions = {
        url: url,
        headers: tokenManager.getAuthHeaders(),
        connectTimeout: APP_CONFIG.REQUEST_TIMEOUT,
        readTimeout: APP_CONFIG.REQUEST_TIMEOUT,
        ...options
      };
      
      // Convertir body a data para CapacitorHttp
      if (options.body) {
        requestOptions.data = JSON.parse(options.body);
        delete requestOptions.body;
      }
      
      logger.log('Mobile API Request:', url, requestOptions);
      
      const response = await CapacitorHttp.request({
        method: options.method || 'GET',
        ...requestOptions
      });
      
      if (response.status >= 400) {
        // Si el token expiró o es inválido en móvil, limpiar y redirigir al login
        if (response.status === 401) {
          console.warn('🔐 Token expirado/inválido (móvil) - redirigiendo al login');
          tokenManager.forceRemove();
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
        const error = new Error(`HTTP ${response.status}: ${response.data || 'Error desconocido'}`);
        error.status = response.status;
        throw error;
      }
      
      logger.log('Mobile API Response:', response.data);
      return response.data;
      
    } else {
      // Usar fetch para aplicaciones web
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.REQUEST_TIMEOUT);
      
      const defaultOptions = {
        headers: tokenManager.getAuthHeaders(),
        signal: controller.signal,
        ...options
      };
      
      logger.log('Web API Request:', url, defaultOptions);
      
      const response = await fetch(url, defaultOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP ${response.status}: ${errorText}`);
        error.status = response.status;
        
        // Si el token expiró o es inválido, limpiar y redirigir al login
        if (response.status === 401) {
          console.warn('🔐 Token expirado/inválido - redirigiendo al login');
          tokenManager.forceRemove();
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }
        
        throw error;
      }
      
      const data = await response.json();
      logger.log('Web API Response:', data);
      
      return data;
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.error('Request timeout:', url);
      throw new Error('La solicitud tardó demasiado tiempo. Verifica tu conexión.');
    }
    
    // Manejo específico de errores de red
    if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
      logger.error('Network error:', error.message);
      throw new Error('Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible.');
    }
    
    logger.error('API Request failed:', error.message);
    throw error;
  }
};
