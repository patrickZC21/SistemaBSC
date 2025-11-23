import { useEffect, useRef } from 'react';
import { buildApiUrl, tokenManager, logger } from '../config/app-security.js';

export function useSSENotifications(onAsistenciaChange) {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const token = tokenManager.get();
    if (!token) return;

    // Crear conexión SSE
    const baseUrl = buildApiUrl('/api/notifications/events');
    const eventSource = new EventSource(`${baseUrl}?token=${token}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      logger.log('📡 Conexión SSE establecida');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        logger.log('📨 Notificación recibida:', data);

        if (data.type === 'asistencia_change' && typeof onAsistenciaChange === 'function') {
          onAsistenciaChange(data);
        }
      } catch (error) {
        logger.error('Error procesando notificación SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      logger.error('❌ Error en conexión SSE:', error);
    };

    // Cleanup al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        logger.log('🔌 Conexión SSE cerrada');
      }
    };
  }, [onAsistenciaChange]);

  return eventSourceRef.current;
}
