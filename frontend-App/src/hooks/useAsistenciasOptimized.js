import { useState, useEffect, useCallback, useRef } from "react";
import { logger, apiCache } from "../config/app-security.js";
import { getAsistenciasPorFechaOptimized } from "../services/asistenciaOptimized.service";
import { useSubalmacenFechas } from "./useSubalmacenFechas";
import { useOptimizedState, useDebounce } from "./useOptimized";

// Cache keys para diferentes tipos de datos
const CACHE_KEYS = {
  asistencias: (subalmacenId, fecha) => `asistencias_${subalmacenId}_${fecha}`,
  trabajadores: (subalmacenId, fecha) => `trabajadores_${subalmacenId}_${fecha}`
};

// Tiempo de cache en milisegundos (5 minutos)
const CACHE_TIME = 5 * 60 * 1000;

export default function useAsistenciasOptimized(subalmacenId) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const { fechas = [] } = useSubalmacenFechas(subalmacenId);
  const requestsInProgress = useRef(new Set());
  const lastRequestTime = useRef(0);
  
  // Estados optimizados con cache
  const {
    state: asistencias,
    setState: setAsistencias,
    loading: loadingAsistencias,
    error: errorAsistencias,
    updateState: updateAsistencias,
    clearCache: clearAsistenciasCache
  } = useOptimizedState([], CACHE_KEYS.asistencias(subalmacenId, fechaSeleccionada));

  const {
    state: trabajadores,
    setState: setTrabajadores,
    updateState: updateTrabajadores
  } = useOptimizedState([], CACHE_KEYS.trabajadores(subalmacenId, fechaSeleccionada));

  const seleccionarFecha = useCallback((fecha) => {
    setFechaSeleccionada(fecha);
    // Limpiar cache anterior cuando cambia la fecha
    if (fechaSeleccionada && fechaSeleccionada !== fecha) {
      clearAsistenciasCache();
    }
  }, [fechaSeleccionada, clearAsistenciasCache]);

  // Función optimizada para cargar asistencias
  const cargarAsistenciasOptimized = useCallback(async (fecha, options = {}) => {
    const { forceRefresh = false, useCache = true } = options;
    
    if (!subalmacenId || !fecha) {
      setAsistencias([]);
      setTrabajadores([]);
      return [];
    }

    // Evitar peticiones duplicadas
    const requestKey = `${subalmacenId}_${fecha}`;
    if (requestsInProgress.current.has(requestKey)) {
      logger.log('Petición ya en progreso, evitando duplicado:', requestKey);
      return asistencias;
    }

    // Throttling: evitar peticiones muy frecuentes (mínimo 1 segundo entre peticiones)
    const now = Date.now();
    if (now - lastRequestTime.current < 1000 && !forceRefresh) {
      logger.log('Petición muy frecuente, usando datos actuales');
      return asistencias;
    }

    try {
      requestsInProgress.current.add(requestKey);
      lastRequestTime.current = now;
      
      logger.log('cargarAsistenciasOptimized llamado con:', { fecha, subalmacenId, forceRefresh, useCache });
      
      const data = await updateAsistencias(
        async (signal) => {
          // Si se fuerza refresh, limpiar cache primero
          if (forceRefresh) {
            apiCache.delete(CACHE_KEYS.asistencias(subalmacenId, fecha));
            apiCache.delete(CACHE_KEYS.trabajadores(subalmacenId, fecha));
          }
          
          return await getAsistenciasPorFechaOptimized(subalmacenId, fecha, { forceRefresh, useCache });
        },
        { useCache, cacheTime: CACHE_TIME }
      );

      // Derivar trabajadores únicos de las asistencias de forma optimizada
      if (Array.isArray(data) && data.length > 0) {
        const trabajadoresUnicos = await updateTrabajadores(
          () => {
            const trabajadoresMap = new Map();
            data.forEach((asistencia) => {
              if (asistencia.trabajador_id && asistencia.trabajador_nombre && !trabajadoresMap.has(asistencia.trabajador_id)) {
                trabajadoresMap.set(asistencia.trabajador_id, {
                  id: asistencia.trabajador_id,
                  nombre: asistencia.trabajador_nombre,
                  dni: asistencia.trabajador_dni || "",
                });
              }
            });
            return Array.from(trabajadoresMap.values());
          },
          { useCache, cacheTime: CACHE_TIME }
        );
        
        logger.log('Trabajadores únicos derivados (optimizado):', trabajadoresUnicos.length);
      } else {
        setTrabajadores([]);
      }

      return data || [];
    } catch (error) {
      logger.error('Error en cargarAsistenciasOptimized:', error);
      throw error;
    } finally {
      requestsInProgress.current.delete(requestKey);
    }
  }, [subalmacenId, updateAsistencias, updateTrabajadores, setAsistencias, setTrabajadores, asistencias]);

  // Versión con debounce para evitar llamadas excesivas
  const cargarAsistenciasDebounced = useDebounce(cargarAsistenciasOptimized, 300);

  // Función para refrescar datos (forzar actualización)
  const refreshAsistencias = useCallback(async (fecha = fechaSeleccionada) => {
    if (!fecha) return [];
    return await cargarAsistenciasOptimized(fecha, { forceRefresh: true });
  }, [cargarAsistenciasOptimized, fechaSeleccionada]);

  // Función para limpiar todo el cache
  const clearAllCache = useCallback(() => {
    clearAsistenciasCache();
    // Limpiar cache de trabajadores también
    if (fechaSeleccionada) {
      apiCache.delete(CACHE_KEYS.trabajadores(subalmacenId, fechaSeleccionada));
    }
  }, [clearAsistenciasCache, subalmacenId, fechaSeleccionada]);

  return {
    fechas,
    trabajadores,
    asistencias,
    fechaSeleccionada,
    loading: loadingAsistencias,
    error: errorAsistencias,
    seleccionarFecha,
    cargarAsistencias: cargarAsistenciasOptimized,
    cargarAsistenciasDebounced,
    refreshAsistencias,
    clearAllCache
  };
}