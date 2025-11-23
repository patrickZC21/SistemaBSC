import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { logger } from '../config/app-security.js';

/**
 * Hook para prevenir cierres innecesarios de la aplicación en dispositivos móviles
 * Especialmente útil para Android donde la navegación del navegador puede ser diferente
 */
export function usePreventAppClose() {
  useEffect(() => {
    let backButtonListener = null;

    // Configurar el manejo del botón de retroceso en Android
    const setupBackButtonHandler = async () => {
      try {
        // Verificar si estamos en un entorno móvil con Capacitor
        const info = await App.getInfo();
        logger.log('App info:', info);

        // Manejar el botón de retroceso de Android
        backButtonListener = await App.addListener('backButton', (data) => {
          logger.log('Botón de retroceso presionado:', data);
          
          // En lugar de cerrar la aplicación, la enviamos al segundo plano
          if (data.canGoBack) {
            // Si hay historial de navegación, navegar hacia atrás
            window.history.back();
          } else {
            // Si no hay historial, enviar la app al segundo plano
            App.minimizeApp();
            logger.log('Aplicación enviada al segundo plano');
          }
        });

        logger.log('Listener del botón de retroceso configurado');
      } catch (error) {
        logger.log('No se pudo configurar el listener del botón de retroceso (probablemente en web):', error.message);
      }
    };

    // Prevenir cierre accidental con beforeunload solo en casos específicos
    const handleBeforeUnload = (event) => {
      // Solo prevenir si hay datos no guardados o procesos importantes
      const hasUnsavedData = sessionStorage.getItem('hasUnsavedData');
      
      if (hasUnsavedData === 'true') {
        event.preventDefault();
        event.returnValue = '¿Estás seguro de que quieres salir? Hay cambios sin guardar.';
        return event.returnValue;
      }
    };

    // Manejar visibilidad de la página para dispositivos móviles
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logger.log('Aplicación en segundo plano - manteniendo sesión activa');
        // NO limpiar datos de sesión cuando se minimiza
        // Solo limpiar datos temporales de formularios si es necesario
        // sessionStorage.removeItem('hasUnsavedData'); // Comentado para mantener sesión
      } else {
        logger.log('Aplicación en primer plano - sesión restaurada');
      }
    };

    // Configurar listeners
    setupBackButtonHandler();
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Funciones utilitarias para marcar datos como guardados/no guardados
  const markDataAsSaved = () => {
    sessionStorage.removeItem('hasUnsavedData');
  };

  const markDataAsUnsaved = () => {
    sessionStorage.setItem('hasUnsavedData', 'true');
  };

  return {
    markDataAsSaved,
    markDataAsUnsaved
  };
}

/**
 * Hook específico para prevenir navegación accidental en formularios
 */
export function usePreventFormExit(hasUnsavedChanges = false) {
  useEffect(() => {
    if (hasUnsavedChanges) {
      sessionStorage.setItem('hasUnsavedData', 'true');
    } else {
      sessionStorage.removeItem('hasUnsavedData');
    }
  }, [hasUnsavedChanges]);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('hasUnsavedData');
    };
  }, []);
}