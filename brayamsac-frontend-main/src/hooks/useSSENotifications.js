import { useEffect, useRef } from 'react';
import { buildApiUrl } from '../config/security.js';

export function useSSENotifications(onAsistenciaChange) {
  // Usar ref para el callback — así el EventSource no se recrea cuando el callback cambia
  const callbackRef = useRef(onAsistenciaChange);
  useEffect(() => { callbackRef.current = onAsistenciaChange; }, [onAsistenciaChange]);

  const eventSourceRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Crear conexión SSE (solo una vez)
    const eventSource = new EventSource(buildApiUrl(`/api/notifications/events?token=${token}`));
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('📡 Conexión SSE establecida - Frontend');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Notificación recibida - Frontend:', data);

        if (data.type === 'asistencia_change' && typeof callbackRef.current === 'function') {
          callbackRef.current(data);
        }
      } catch (error) {
        console.error('Error procesando notificación SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Error en conexión SSE - Frontend:', error);
    };

    // Cleanup al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        console.log('🔌 Conexión SSE cerrada - Frontend');
      }
    };
  }, []); // ← dependencias vacías = SSE se conecta UNA sola vez

  return eventSourceRef.current;
}
