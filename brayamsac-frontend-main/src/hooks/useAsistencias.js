import { useCallback, useEffect, useState, useRef } from "react";

import { buildApiUrl, tokenManager, logger } from '../config/security.js';
import { rateLimitedFetch } from '../utils/rateLimiter.js';
import { useSSENotifications } from './useSSENotifications.js';

// Cache simple en memoria para evitar consultas repetidas
const cache = new Map();
const CACHE_DURATION = 30000; // 30 segundos

export function useAsistencias(subalmacenId, fecha, navigate) {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [almacenNombre, setAlmacenNombre] = useState("");
  const [subalmacenNombre, setSubalmacenNombre] = useState("");
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!subalmacenId) return;
    const token = tokenManager.get();
    rateLimitedFetch(buildApiUrl(`/api/subalmacenes/${subalmacenId}`), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
      .then(res => {
        if (res.status === 401) {
          setAlmacenNombre("");
          setSubalmacenNombre("");
          logger.log("[Asistencias] Token inválido al obtener subalmacén");
          return {};
        }
        return res.json();
      })
      .then(data => {
        setSubalmacenNombre(data.nombre || "");
        setAlmacenNombre(data.almacen_nombre || "");
        logger.log("[Asistencias] Nombres obtenidos:", {
          almacen: data.almacen_nombre,
          subalmacen: data.nombre,
        });
      })
      .catch(() => {
        setSubalmacenNombre("");
        setAlmacenNombre("");
        logger.log("[Asistencias] Error al obtener nombres de almacén/subalmacén");
      });
  }, [subalmacenId]);

  // Función interna que hace el fetch real — acepta un flag "silent" para no mostrar loading
  const doFetch = useCallback((silent = false) => {
    if (!subalmacenId || !fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      setLoading(false);
      setAsistencias([]);
      logger.log("[useAsistencias] Parámetros inválidos para obtener asistencias", { subalmacenId, fecha });
      return;
    }

    // Cancelar solicitud anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    // Verificar cache (solo si no es silent — las actualizaciones SSE siempre van al servidor)
    if (!silent) {
      const cacheKey = `${subalmacenId}-${fecha}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        logger.log("[useAsistencias] Usando datos del cache", { subalmacenId, fecha });
        setAsistencias(cachedData.data);
        setLoading(false);
        return;
      }
    }

    const startTime = performance.now();
    
    // Solo mostrar loading en la carga inicial, NO en actualizaciones SSE silenciosas
    if (!silent) {
      setLoading(true);
    }
    
    const token = tokenManager.get();
    
    logger.log(`[useAsistencias] ${silent ? '🔇 Refetch silencioso' : 'Iniciando solicitud'} de asistencias:`, { subalmacenId, fecha });
    
    const url = buildApiUrl('/api/asistencias', {
      subalmacen_id: subalmacenId,
      fecha: fecha
    });
    
    rateLimitedFetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: abortControllerRef.current.signal
    })
      .then(async (res) => {
        const networkTime = performance.now() - startTime;
        logger.performance("Network Request", networkTime, { url, status: res.status });
        
        if (res.status === 401) {
          setAsistencias([]);
          setLoading(false);
          alert("Sesión expirada o acceso no autorizado. Por favor, vuelve a iniciar sesión.");
          navigate("/");
          logger.log("[useAsistencias] Sesión expirada o acceso no autorizado");
          return [];
        }
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        return res.json();
      })
      .then((data) => {
        const totalTime = performance.now() - startTime;
        const recordCount = Array.isArray(data) ? data.length : 0;
        
        // Guardar en cache
        const cacheKey = `${subalmacenId}-${fecha}`;
        cache.set(cacheKey, {
          data: Array.isArray(data) ? data : [],
          timestamp: Date.now()
        });
        
        // Actualizar estado — React solo re-renderiza los nodos del DOM que cambiaron
        setAsistencias(Array.isArray(data) ? data : []);
        logger.performance("Total Request", totalTime, { recordCount, cached: false, silent });
        
        if (recordCount === 0) {
          logger.log("[useAsistencias] No se encontraron asistencias para los filtros especificados");
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          logger.log("[useAsistencias] Solicitud cancelada");
          return;
        }
        
        const totalTime = performance.now() - startTime;
        // En modo silencioso, NO borrar los datos existentes ante un error
        if (!silent) {
          setAsistencias([]);
        }
        logger.error(`[useAsistencias] Error después de ${totalTime.toFixed(2)}ms:`, {
          message: error.message,
          subalmacenId,
          fecha,
          url
        });
        
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          console.error('Error de conexión. Verifique su conexión a internet.');
        }
      })
      .finally(() => {
        setLoading(false);
        abortControllerRef.current = null;
      });
  }, [subalmacenId, fecha, navigate]);

  // Wrapper para carga inicial (puede usar cache)
  const fetchAsistencias = useCallback(() => {
    doFetch(false);
  }, [doFetch]);

  // Wrapper para refetch manual después de editar/eliminar (SIEMPRE limpia cache)
  const refetchManual = useCallback(() => {
    const cacheKey = `${subalmacenId}-${fecha}`;
    cache.delete(cacheKey);
    doFetch(false);
  }, [doFetch, subalmacenId, fecha]);

  // Wrapper para actualización SSE silenciosa (NO muestra loading)
  const silentRefetch = useCallback(() => {
    doFetch(true);
  }, [doFetch]);

  // Refs estables para el callback SSE — evita que useSSENotifications se reconecte
  const subalmacenIdRef = useRef(subalmacenId);
  const fechaRef = useRef(fecha);
  const silentRefetchRef = useRef(silentRefetch);
  
  useEffect(() => { subalmacenIdRef.current = subalmacenId; }, [subalmacenId]);
  useEffect(() => { fechaRef.current = fecha; }, [fecha]);
  useEffect(() => { silentRefetchRef.current = silentRefetch; }, [silentRefetch]);

  // Callback SSE estable (no cambia de referencia → no reconecta SSE)
  const handleSSENotification = useCallback((notification) => {
    console.log('🔔 Notificación de cambio recibida - Frontend:', notification);
    if (notification.subalmacen_id == subalmacenIdRef.current) {
      console.log('✅ Actualizando asistencias en tiempo real (sin recargar página)');
      // Limpiar cache y hacer refetch SILENCIOSO
      const cacheKey = `${subalmacenIdRef.current}-${fechaRef.current}`;
      cache.delete(cacheKey);
      silentRefetchRef.current();
    }
  }, []); // ← dependencias vacías = referencia estable = SSE no se reconecta

  // Manejar notificaciones SSE para actualización en tiempo real
  useSSENotifications(handleSSENotification);

  useEffect(() => {
    fetchAsistencias();
    
    // Cleanup: cancelar solicitudes pendientes al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAsistencias]);

  // Función para limpiar cache manualmente
  const clearCache = useCallback(() => {
    const cacheKey = `${subalmacenId}-${fecha}`;
    cache.delete(cacheKey);
    logger.log("[useAsistencias] Cache limpiado para:", cacheKey);
  }, [subalmacenId, fecha]);

  return { 
    asistencias, 
    loading, 
    almacenNombre, 
    subalmacenNombre, 
    refetchAsistencias: refetchManual,
    clearCache
  };
}