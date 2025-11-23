import { useEffect, useState, useRef } from "react";
import { getSubalmacenes } from "../services/subalmacenesService";
import { tokenManager, apiCache, logger } from '../config/app-security.js';
import { useOptimizedState } from './useOptimized';

// Cache key para subalmacenes
const CACHE_KEY = 'subalmacenes_list';
const CACHE_TIME = 10 * 60 * 1000; // 10 minutos

// Prevenir peticiones duplicadas
const requestInProgress = { current: false };

export function useSubalmacenesOptimized() {
  const [subalmacenes, setSubalmacenes] = useOptimizedState([], CACHE_KEY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const loadSubalmacenes = async () => {
      // Verificar cache primero
      const cachedData = apiCache.get(CACHE_KEY);
      if (cachedData && cachedData.timestamp > Date.now() - CACHE_TIME) {
        logger.log('Usando subalmacenes desde cache');
        setSubalmacenes(cachedData.data);
        return;
      }

      // Evitar peticiones duplicadas
      if (requestInProgress.current) {
        logger.log('Petición de subalmacenes ya en progreso');
        return;
      }

      requestInProgress.current = true;
      setLoading(true);
      setError(null);

      try {
        const token = tokenManager.get();
        const data = await getSubalmacenes(token);
        
        if (mountedRef.current) {
          setSubalmacenes(data);
          
          // Guardar en cache
          apiCache.set(CACHE_KEY, {
            data,
            timestamp: Date.now()
          });
          
          logger.log('Subalmacenes cargados y guardados en cache:', data.length);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err.message);
          logger.error('Error al cargar subalmacenes:', err);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        requestInProgress.current = false;
      }
    };

    loadSubalmacenes();

    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Función para refrescar datos
  const refreshSubalmacenes = async () => {
    apiCache.delete(CACHE_KEY);
    requestInProgress.current = false;
    
    const token = tokenManager.get();
    try {
      setLoading(true);
      const data = await getSubalmacenes(token);
      setSubalmacenes(data);
      
      // Actualizar cache
      apiCache.set(CACHE_KEY, {
        data,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { 
    subalmacenes, 
    loading, 
    error, 
    refreshSubalmacenes 
  };
}

// Función para limpiar cache de subalmacenes
export const clearSubalmacenesCache = () => {
  apiCache.delete(CACHE_KEY);
  requestInProgress.current = false;
};