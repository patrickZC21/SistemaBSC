// Hook optimizado para gestión de estados complejos con cache
import { useState, useCallback, useRef } from 'react';
import { apiCache, logger } from '../config/app-security.js';

export const useOptimizedState = (initialState, cacheKey = null) => {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Cancelar requests anteriores para evitar race conditions
  const cancelPreviousRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  const updateState = useCallback(async (updateFn, options = {}) => {
    const { useCache = false, cacheTime = 5 * 60 * 1000 } = options;
    
    try {
      setError(null);
      setLoading(true);

      // Verificar cache si está habilitado
      if (useCache && cacheKey) {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          logger.log('Datos obtenidos del cache:', cacheKey);
          setState(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      const signal = cancelPreviousRequests();
      
      let result;
      if (typeof updateFn === 'function') {
        result = await updateFn(signal);
      } else {
        result = updateFn;
      }

      // Guardar en cache si está habilitado
      if (useCache && cacheKey && result) {
        apiCache.set(cacheKey, result);
      }

      setState(result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        logger.error('Error en updateState:', error);
        setError(error.message || 'Error desconocido');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, cancelPreviousRequests]);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      apiCache.delete(cacheKey);
    }
  }, [cacheKey]);

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
    setLoading(false);
    clearCache();
  }, [initialState, clearCache]);

  return {
    state,
    setState,
    loading,
    error,
    updateState,
    clearCache,
    reset
  };
};

// Hook para debounce de funciones (evitar llamadas excesivas)
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Hook para memoización avanzada
export const useAdvancedMemo = (factory, deps, options = {}) => {
  const { maxAge = 5 * 60 * 1000, key } = options;
  const cacheRef = useRef(new Map());
  const depsRef = useRef(deps);

  // Verificar si las dependencias han cambiado
  const depsChanged = deps.some((dep, index) => dep !== depsRef.current[index]);

  if (depsChanged || !cacheRef.current.has(key || 'default')) {
    const result = factory();
    const cacheEntry = {
      value: result,
      timestamp: Date.now()
    };
    
    cacheRef.current.set(key || 'default', cacheEntry);
    depsRef.current = deps;
    
    return result;
  }

  const cached = cacheRef.current.get(key || 'default');
  
  // Verificar si el cache ha expirado
  if (Date.now() - cached.timestamp > maxAge) {
    const result = factory();
    const cacheEntry = {
      value: result,
      timestamp: Date.now()
    };
    
    cacheRef.current.set(key || 'default', cacheEntry);
    depsRef.current = deps;
    
    return result;
  }

  return cached.value;
};
