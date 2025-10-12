// Sistema centralizado de manejo de errores
class ErrorManager {
  constructor() {
    this.errorHandlers = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 50;
    
    // Configurar manejadores globales
    this.setupGlobalHandlers();
  }
  
  setupGlobalHandlers() {
    // Capturar errores JavaScript no manejados
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled_promise',
        message: event.reason?.message || 'Promise rejected',
        stack: event.reason?.stack,
        reason: event.reason,
        timestamp: new Date().toISOString()
      });
    });
    
    // Capturar errores de red
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.handleError({
            type: 'network',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
          });
        }
        
        return response;
      } catch (error) {
        this.handleError({
          type: 'network',
          message: error.message,
          url: args[0],
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    };
  }
  
  // Registrar manejador de errores por tipo
  registerHandler(errorType, handler) {
    if (!this.errorHandlers.has(errorType)) {
      this.errorHandlers.set(errorType, []);
    }
    this.errorHandlers.get(errorType).push(handler);
  }
  
  // Remover manejador de errores
  removeHandler(errorType, handler) {
    if (this.errorHandlers.has(errorType)) {
      const handlers = this.errorHandlers.get(errorType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  // Manejar error
  handleError(error) {
    // Agregar al historial
    this.addToHistory(error);
    
    // Ejecutar manejadores registrados
    const handlers = this.errorHandlers.get(error.type) || [];
    handlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error en manejador de errores:', handlerError);
      }
    });
    
    // Ejecutar manejadores globales
    const globalHandlers = this.errorHandlers.get('*') || [];
    globalHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error en manejador global:', handlerError);
      }
    });
    
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.group(`🚨 Error [${error.type}]`);
      console.error('Message:', error.message);
      console.error('Details:', error);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
      console.groupEnd();
    }
  }
  
  // Agregar error al historial
  addToHistory(error) {
    this.errorHistory.unshift({
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    // Mantener tamaño máximo del historial
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }
  
  // Obtener historial de errores
  getErrorHistory() {
    return [...this.errorHistory];
  }
  
  // Limpiar historial
  clearHistory() {
    this.errorHistory = [];
  }
  
  // Reportar error manualmente
  reportError(error, context = {}) {
    const errorData = {
      type: 'manual',
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    this.handleError(errorData);
  }
  
  // Obtener estadísticas de errores
  getErrorStats() {
    const stats = {
      total: this.errorHistory.length,
      byType: {},
      recent: this.errorHistory.slice(0, 10)
    };
    
    this.errorHistory.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });
    
    return stats;
  }
}

// Instancia global del manejador de errores
export const errorManager = new ErrorManager();

// Categorías de errores predefinidas
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTH: 'auth',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  CLIENT: 'client',
  JAVASCRIPT: 'javascript',
  UNHANDLED_PROMISE: 'unhandled_promise',
  MANUAL: 'manual'
};

// Errores personalizados
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.CLIENT, context = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export class NetworkError extends AppError {
  constructor(message, status, url) {
    super(message, ERROR_TYPES.NETWORK, { status, url });
    this.name = 'NetworkError';
    this.status = status;
    this.url = url;
  }
}

export class ValidationError extends AppError {
  constructor(message, field, value) {
    super(message, ERROR_TYPES.VALIDATION, { field, value });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class AuthError extends AppError {
  constructor(message) {
    super(message, ERROR_TYPES.AUTH);
    this.name = 'AuthError';
  }
}

// Hook para usar manejo de errores en componentes React
import { useCallback, useEffect } from 'react';

export const useErrorHandler = () => {
  const handleError = useCallback((error, context = {}) => {
    if (error instanceof AppError) {
      errorManager.handleError({
        type: error.type,
        message: error.message,
        context: { ...error.context, ...context },
        stack: error.stack,
        timestamp: error.timestamp
      });
    } else {
      errorManager.reportError(error, context);
    }
  }, []);
  
  const handleAsyncError = useCallback(async (asyncFn, context = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError]);
  
  return {
    handleError,
    handleAsyncError,
    reportError: errorManager.reportError.bind(errorManager),
    getErrorStats: errorManager.getErrorStats.bind(errorManager)
  };
};

// Utilidades para manejo común de errores
export const errorUtils = {
  // Convertir respuesta de API a error apropiado
  fromResponse: async (response) => {
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    
    switch (response.status) {
      case 400:
        return new ValidationError(data.message || 'Datos inválidos');
      case 401:
        return new AuthError(data.message || 'No autorizado');
      case 403:
        return new AppError(data.message || 'Sin permisos', ERROR_TYPES.PERMISSION);
      case 404:
        return new AppError(data.message || 'Recurso no encontrado', ERROR_TYPES.NOT_FOUND);
      case 500:
        return new AppError(data.message || 'Error interno del servidor', ERROR_TYPES.SERVER);
      default:
        return new NetworkError(
          data.message || `Error ${response.status}`,
          response.status,
          response.url
        );
    }
  },
  
  // Formatear error para mostrar al usuario
  formatForUser: (error) => {
    if (error instanceof ValidationError) {
      return `Error de validación: ${error.message}`;
    }
    
    if (error instanceof AuthError) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    
    if (error instanceof NetworkError) {
      if (error.status >= 500) {
        return 'Error del servidor. Por favor, intenta más tarde.';
      }
      return error.message;
    }
    
    // Error genérico
    return error.message || 'Ocurrió un error inesperado';
  },
  
  // Determinar si el error es recuperable
  isRecoverable: (error) => {
    if (error instanceof NetworkError) {
      return error.status < 500; // Errores del servidor no son recuperables
    }
    
    if (error instanceof AuthError) {
      return true; // Usuario puede volver a autenticarse
    }
    
    return error.type !== ERROR_TYPES.JAVASCRIPT;
  }
};
