import { useEffect } from 'react';
import { buildApiUrl, tokenManager, logger } from '../config/app-security.js';

/**
 * Hook para manejar logout automático cuando se cierra la aplicación
 * Diferencia entre cerrar la app y minimizarla para evitar logout innecesario
 */
export function useAutoLogout() {
  useEffect(() => {
    let isAppClosing = false;
    let visibilityTimer = null;

    // Función para realizar logout
    const performLogout = async () => {
      try {
        const token = tokenManager.get();
        if (!token) return;

        // Verificar si la sesión está marcada como persistente
        if (tokenManager.isSessionPersistent()) {
          logger.log('🔴 AUTO-LOGOUT: Sesión persistente - cancelando logout automático');
          return;
        }

        logger.log('🔴 AUTO-LOGOUT: Iniciando logout automático...');
        
        const url = buildApiUrl('/api/auth/logout');
        
        // Usar fetch con keepalive para asegurar que la request se complete
        // incluso si la página se está cerrando
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          keepalive: true // Importante: mantiene la request activa aunque se cierre la página
        });

        if (response.ok) {
          logger.log('🔴 AUTO-LOGOUT: Logout exitoso');
        } else {
          logger.warn('🔴 AUTO-LOGOUT: Error en logout:', response.status);
        }
      } catch (error) {
        logger.error('🔴 AUTO-LOGOUT: Error en logout automático:', error);
        
        // Fallback con sendBeacon si fetch falla
        try {
          const token = tokenManager.get();
          if (token && navigator.sendBeacon) {
            const url = buildApiUrl('/api/auth/logout');
            const data = new FormData();
            data.append('token', token);
            navigator.sendBeacon(url, data);
            logger.log('🔴 AUTO-LOGOUT: Fallback con sendBeacon ejecutado');
          }
        } catch (beaconError) {
          logger.error('🔴 AUTO-LOGOUT: Error en fallback sendBeacon:', beaconError);
        }
      } finally {
        // Limpiar token local
        tokenManager.remove();
      }
    };

    // Manejar beforeunload (antes de cerrar/recargar)
    const handleBeforeUnload = (event) => {
      // Detectar si es un cierre real de la aplicación
      isAppClosing = true;
      
      // Solo hacer logout si realmente se está cerrando
      // No en caso de recarga o navegación
      if (event.type === 'beforeunload') {
        performLogout();
      }
    };

    // Manejar unload (al cerrar definitivamente)
    const handleUnload = () => {
      if (isAppClosing) {
        performLogout();
      }
    };

    // Manejar cambios de visibilidad
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // La aplicación se oculta (puede ser minimizada o cerrada)
        logger.log('🔴 AUTO-LOGOUT: Aplicación oculta');
        
        // Esperar un tiempo antes de considerar logout
        // Si la app vuelve a ser visible antes de este tiempo, cancelar logout
        visibilityTimer = setTimeout(() => {
          // Solo hacer logout si la app sigue oculta después del timeout
          // y no es un entorno móvil (donde minimizar es común)
          const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
          
          if (document.hidden && !isMobile) {
            logger.log('🔴 AUTO-LOGOUT: Timeout alcanzado, ejecutando logout');
            performLogout();
          }
        }, 30000); // 30 segundos de gracia
        
      } else {
        // La aplicación vuelve a ser visible
        logger.log('🔴 AUTO-LOGOUT: Aplicación visible de nuevo');
        
        // Cancelar logout programado
        if (visibilityTimer) {
          clearTimeout(visibilityTimer);
          visibilityTimer = null;
          logger.log('🔴 AUTO-LOGOUT: Logout cancelado - app visible');
        }
        
        isAppClosing = false;
      }
    };

    // Manejar pagehide (más confiable que unload en algunos navegadores)
    const handlePageHide = (event) => {
      // Si persisted es false, la página se está descargando completamente
      if (!event.persisted) {
        logger.log('🔴 AUTO-LOGOUT: Página descargándose completamente');
        performLogout();
      }
    };

    // Configurar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (visibilityTimer) {
        clearTimeout(visibilityTimer);
      }
    };
  }, []);
}

/**
 * Hook para mantener sesión persistente - NO hace logout automático
 * Diseñado específicamente para aplicaciones móviles donde cerrar ventana
 * no debe cerrar la sesión del usuario
 */
export function useAutoLogoutOnClose() {
  useEffect(() => {
    // Detectar si estamos en un entorno móvil
    const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
    
    // Función universal para prevenir logout en móviles
    const handleAnyCloseEvent = (event) => {
      if (isMobile) {
        // En móvil, NUNCA hacer logout automático
        logger.log(`🔐 MÓVIL: Evento ${event.type} - manteniendo sesión activa`);
        
        // Marcar explícitamente la sesión como persistente
        tokenManager.markSessionPersistent();
        
        // Guardar timestamp de última actividad
        try {
          localStorage.setItem('lastActivity', Date.now().toString());
          localStorage.setItem('sessionActive', 'true');
          localStorage.setItem('mobileSessionPersistent', 'true');
        } catch (error) {
          logger.error('Error guardando estado de sesión:', error);
        }
        
        // Prevenir cualquier acción de cierre
        if (event.preventDefault) {
          event.preventDefault();
        }
        if (event.returnValue !== undefined) {
          event.returnValue = '';
        }
        
        return false; // NO hacer logout
      }
      
      // Solo en navegadores web, verificar si realmente se debe hacer logout
      const shouldLogout = !tokenManager.isSessionPersistent();
      
      if (shouldLogout) {
        logger.log(`🔴 WEB: Evento ${event.type} - ejecutando logout`);
        
        // Hacer logout solo en navegadores web cuando no es sesión persistente
        const performLogout = async () => {
          try {
            const token = tokenManager.get();
            if (!token) return;

            const url = buildApiUrl('/api/auth/logout');
            
            await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              keepalive: true
            });
            
            // En web, usar forceRemove para asegurar logout
            tokenManager.forceRemove();
          } catch (error) {
            logger.error('Error en logout:', error);
            // En web, usar forceRemove para asegurar logout
            tokenManager.forceRemove();
          }
        };
        
        performLogout();
      } else {
        logger.log(`🔐 WEB: Evento ${event.type} - sesión persistente mantenida`);
      }
    };
    
    // Función específica para visibilitychange en móviles
    const handleVisibilityChange = () => {
      if (isMobile && document.hidden) {
        logger.log('🔐 MÓVIL: App en segundo plano - manteniendo sesión activa');
        
        // Asegurar que la sesión se mantenga
        tokenManager.markSessionPersistent();
        localStorage.setItem('lastActivity', Date.now().toString());
        localStorage.setItem('sessionActive', 'true');
        localStorage.setItem('mobileSessionPersistent', 'true');
      }
    };

    // Configurar múltiples listeners para capturar todos los eventos de cierre
    window.addEventListener('beforeunload', handleAnyCloseEvent);
    window.addEventListener('unload', handleAnyCloseEvent);
    window.addEventListener('pagehide', handleAnyCloseEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Si es móvil, marcar inmediatamente la sesión como persistente
    if (isMobile) {
      logger.log('🔐 MÓVIL: Inicializando sesión persistente');
      tokenManager.markSessionPersistent();
      localStorage.setItem('mobileSessionPersistent', 'true');
    }

    return () => {
      window.removeEventListener('beforeunload', handleAnyCloseEvent);
      window.removeEventListener('unload', handleAnyCloseEvent);
      window.removeEventListener('pagehide', handleAnyCloseEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

/**
 * Hook para restaurar sesión al abrir la aplicación
 * Verifica si hay una sesión válida guardada en localStorage
 */
export function useSessionRestore() {
  useEffect(() => {
    const restoreSession = () => {
      try {
        const lastActivity = localStorage.getItem('lastActivity');
        const sessionActive = localStorage.getItem('sessionActive');
        const mobileSessionPersistent = localStorage.getItem('mobileSessionPersistent');
        const currentToken = tokenManager.get();
        const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
        
        // Verificar si hay datos de sesión guardados
        if (!lastActivity || !sessionActive || sessionActive !== 'true' || !currentToken) {
          logger.log('🔄 No hay sesión válida para restaurar');
          return;
        }
        
        const lastActivityTime = parseInt(lastActivity);
        const currentTime = Date.now();
        const timeDifference = currentTime - lastActivityTime;
        
        // Verificar si la sesión no ha expirado (24 horas = 86400000 ms)
        const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
        
        if (timeDifference > SESSION_TIMEOUT) {
          logger.log('🔄 Sesión expirada, limpiando datos');
          localStorage.removeItem('lastActivity');
          localStorage.removeItem('sessionActive');
          localStorage.removeItem('mobileSessionPersistent');
          // Usar forceRemove para limpiar sesión expirada
          tokenManager.forceRemove();
          return;
        }
        
        // Restaurar sesión
        logger.log('🔄 Restaurando sesión válida');
        tokenManager.markSessionPersistent();
        
        // Si es móvil y tiene la bandera de sesión persistente, asegurar configuración
        if (isMobile && mobileSessionPersistent === 'true') {
          logger.log('🔄 MÓVIL: Restaurando sesión persistente móvil');
          localStorage.setItem('mobileSessionPersistent', 'true');
        }
        
        // Actualizar timestamp de actividad
        localStorage.setItem('lastActivity', Date.now().toString());
        
      } catch (error) {
        logger.error('Error restaurando sesión:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('sessionActive');
        localStorage.removeItem('mobileSessionPersistent');
      }
    };
    
    // Ejecutar restauración al montar el componente
    restoreSession();
  }, []);
}