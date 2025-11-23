import { useEffect, useState, useRef } from "react";
import { buildApiUrl, tokenManager, apiRequest, apiCache, logger } from '../config/app-security.js';
import { useOptimizedState } from './useOptimized';

// Cache key para usuario
const CACHE_KEY = 'current_user';
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

// Prevenir peticiones duplicadas
const requestInProgress = { current: false };

export function useUsuarioOptimized() {
  const [usuario, setUsuario] = useOptimizedState(null, CACHE_KEY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const validateUser = async () => {
      const token = tokenManager.get();
      if (!token) {
        setLoading(false);
        setUsuario(null);
        setError(null);
        return;
      }

      // Verificar cache primero
      const cachedData = apiCache.get(CACHE_KEY);
      if (cachedData && cachedData.timestamp > Date.now() - CACHE_TIME) {
        logger.log('Usando datos de usuario desde cache');
        setUsuario(cachedData.data);
        return;
      }

      // Evitar peticiones duplicadas
      if (requestInProgress.current) {
        logger.log('Validación de usuario ya en progreso');
        return;
      }

      requestInProgress.current = true;
      setLoading(true);
      setError(null);

      try {
        const url = buildApiUrl('/api/auth/validar');
        const data = await apiRequest(url);
        
        if (mountedRef.current) {
          if (data.usuario) {
            setUsuario(data.usuario);
            
            // Guardar en cache
            apiCache.set(CACHE_KEY, {
              data: data.usuario,
              timestamp: Date.now()
            });
            
            logger.log('Usuario validado y guardado en cache:', data.usuario.nombre);
          } else {
            setError("No autenticado");
            setUsuario(null);
          }
        }
      } catch (err) {
        if (mountedRef.current) {
          setError("Error al validar usuario");
          setUsuario(null);
          logger.error('Error al validar usuario:', err);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        requestInProgress.current = false;
      }
    };

    validateUser();

    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Función para refrescar datos del usuario
  const refreshUsuario = async () => {
    apiCache.delete(CACHE_KEY);
    requestInProgress.current = false;
    
    const token = tokenManager.get();
    if (!token) {
      setUsuario(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const url = buildApiUrl('/api/auth/validar');
      const data = await apiRequest(url);
      
      if (data.usuario) {
        setUsuario(data.usuario);
        
        // Actualizar cache
        apiCache.set(CACHE_KEY, {
          data: data.usuario,
          timestamp: Date.now()
        });
      } else {
        setError("No autenticado");
        setUsuario(null);
      }
    } catch (err) {
      setError("Error al validar usuario");
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para logout (limpiar cache)
  const logout = () => {
    apiCache.delete(CACHE_KEY);
    requestInProgress.current = false;
    setUsuario(null);
    setError(null);
    // Usar forceRemove para logout manual (ignora persistencia móvil)
    tokenManager.forceRemove();
  };

  return { 
    usuario, 
    loading, 
    error, 
    refreshUsuario,
    logout 
  };
}

// Función para limpiar cache de usuario
export const clearUsuarioCache = () => {
  apiCache.delete(CACHE_KEY);
  requestInProgress.current = false;
};