import { useEffect, useRef, useState, useCallback } from 'react';
import { buildApiUrl } from '../config/api.js';

/**
 * Hook para obtener actualizaciones del dashboard en tiempo real vía SSE.
 * Escucha el endpoint /api/notifications/dashboard y dispara un callback
 * cuando se recibe un evento de tipo 'dashboard_update'.
 * 
 * También incluye auto-refresh periódico como fallback.
 * 
 * @param {Function} onDashboardUpdate - Callback que se ejecuta cuando hay una actualización
 * @param {number} autoRefreshInterval - Intervalo de auto-refresh en ms (default: 30000 = 30s)
 * @returns {{ isConnected: boolean, lastUpdate: string|null, refreshCount: number }}
 */
export function useDashboardRealtime(onDashboardUpdate, autoRefreshInterval = 30000) {
  const callbackRef = useRef(onDashboardUpdate);
  const eventSourceRef = useRef(null);
  const autoRefreshRef = useRef(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Mantener referencia actualizada del callback
  useEffect(() => { 
    callbackRef.current = onDashboardUpdate; 
  }, [onDashboardUpdate]);

  // Función para disparar la actualización
  const triggerUpdate = useCallback((source = 'auto') => {
    setLastUpdate(new Date().toISOString());
    setRefreshCount(prev => prev + 1);
    if (typeof callbackRef.current === 'function') {
      callbackRef.current({ type: 'dashboard_update', source, timestamp: new Date().toISOString() });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Crear conexión SSE al endpoint de dashboard
    const url = buildApiUrl(`/api/notifications/dashboard?token=${token}`);
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('📊 SSE Dashboard conectado - Tiempo real activado');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('📊 Dashboard SSE: Conexión confirmada');
          setIsConnected(true);
          return;
        }

        if (data.type === 'heartbeat') {
          // Heartbeat recibido, conexión sigue viva
          return;
        }

        if (data.type === 'dashboard_update') {
          console.log(`📊 Dashboard actualización en tiempo real: ${data.source}/${data.action}`);
          setLastUpdate(data.timestamp);
          setRefreshCount(prev => prev + 1);
          
          if (typeof callbackRef.current === 'function') {
            callbackRef.current(data);
          }
        }
      } catch (error) {
        console.error('Error procesando evento SSE del dashboard:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.warn('⚠️ SSE Dashboard desconectado, reintentando automáticamente...');
      setIsConnected(false);
    };

    // Auto-refresh periódico como fallback (por si SSE se desconecta)
    autoRefreshRef.current = setInterval(() => {
      triggerUpdate('auto_refresh');
    }, autoRefreshInterval);

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        console.log('🔌 SSE Dashboard desconectado');
      }
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
      setIsConnected(false);
    };
  }, []); // Se conecta una sola vez al montar

  return { isConnected, lastUpdate, refreshCount };
}
