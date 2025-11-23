import { useEffect, useState, useRef } from 'react';
import { getSubalmacenFechas } from '../services/subalmacenFechas.service';
import { apiCache, logger } from '../config/app-security.js';
import { useOptimizedState, useDebounce } from './useOptimized';

// Cache time para fechas de subalmacén
const CACHE_TIME = 15 * 60 * 1000; // 15 minutos

// Mapa para controlar peticiones en progreso por subalmacén
const requestsInProgress = new Map();

export function useSubalmacenFechasOptimized(subalmacenId) {
  const [fechas, setFechas] = useOptimizedState([], `subalmacen_fechas_${subalmacenId}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const lastSubalmacenIdRef = useRef(subalmacenId);

  // Debounce para evitar peticiones muy frecuentes al cambiar subalmacenId
  const debouncedLoadFechas = useDebounce(async (id) => {
    if (!id || !mountedRef.current) return;

    const cacheKey = `subalmacen_fechas_${id}`;
    
    // Verificar cache primero
    const cachedData = apiCache.get(cacheKey);
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_TIME) {
      logger.log(`Usando fechas de subalmacén ${id} desde cache`);
      setFechas(cachedData.data);
      return;
    }

    // Evitar peticiones duplicadas para el mismo subalmacén
    if (requestsInProgress.get(id)) {
      logger.log(`Petición de fechas para subalmacén ${id} ya en progreso`);
      return;
    }

    requestsInProgress.set(id, true);
    setLoading(true);
    setError(null);

    try {
      const data = await getSubalmacenFechas(id);
      
      if (mountedRef.current && lastSubalmacenIdRef.current === id) {
        setFechas(data);
        
        // Guardar en cache
        apiCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        logger.log(`Fechas de subalmacén ${id} cargadas y guardadas en cache:`, data.length);
      }
    } catch (err) {
      if (mountedRef.current && lastSubalmacenIdRef.current === id) {
        setError(err);
        logger.error(`Error al cargar fechas de subalmacén ${id}:`, err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      requestsInProgress.delete(id);
    }
  }, 300); // 300ms de debounce

  useEffect(() => {
    // Actualizar la referencia del último subalmacenId
    lastSubalmacenIdRef.current = subalmacenId;
    
    if (!subalmacenId) {
      setFechas([]);
      setError(null);
      return;
    }

    debouncedLoadFechas(subalmacenId);
  }, [subalmacenId, debouncedLoadFechas]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Función para refrescar fechas
  const refreshFechas = async () => {
    if (!subalmacenId) return;
    
    const cacheKey = `subalmacen_fechas_${subalmacenId}`;
    apiCache.delete(cacheKey);
    requestsInProgress.delete(subalmacenId);
    
    try {
      setLoading(true);
      const data = await getSubalmacenFechas(subalmacenId);
      setFechas(data);
      
      // Actualizar cache
      apiCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    fechas, 
    loading, 
    error, 
    refreshFechas 
  };
}

// Función para limpiar cache de fechas de un subalmacén específico
export const clearSubalmacenFechasCache = (subalmacenId) => {
  const cacheKey = `subalmacen_fechas_${subalmacenId}`;
  apiCache.delete(cacheKey);
  requestsInProgress.delete(subalmacenId);
};

// Función para limpiar todo el cache de fechas
export const clearAllSubalmacenFechasCache = () => {
  // Limpiar todas las entradas de cache que empiecen con 'subalmacen_fechas_'
  const keys = apiCache.keys();
  keys.forEach(key => {
    if (key.startsWith('subalmacen_fechas_')) {
      apiCache.delete(key);
    }
  });
  
  // Limpiar peticiones en progreso
  requestsInProgress.clear();
};