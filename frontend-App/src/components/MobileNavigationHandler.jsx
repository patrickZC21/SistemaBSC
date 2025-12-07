import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logger } from '../config/app-security.js';

/**
 * Componente para manejar la navegación móvil
 * Usa Capacitor App plugin para el botón de retroceso de Android
 */
const MobileNavigationHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let backButtonListener = null;

    const setupBackButton = async () => {
      try {
        // Importar Capacitor App plugin
        const { App } = await import('@capacitor/app');
        
        backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          const currentPath = location.pathname;
          logger.log('Botón retroceso Android - ruta actual:', currentPath);

          // Si estamos en login o dashboard, cerrar la app
          if (currentPath === '/' || currentPath === '/dashboard-app') {
            App.exitApp();
            return;
          }

          // Navegar hacia atrás según la jerarquía
          if (currentPath.includes('/asistencias/')) {
            // De asistencias → fechas del subalmacén
            const parts = currentPath.split('/');
            const subalmacenId = parts[2]; // /subalmacenes/:id/asistencias/...
            navigate(`/subalmacenes/${subalmacenId}/fechas`);
          } else if (currentPath.includes('/fechas')) {
            // De fechas → subalmacenes del almacén
            const subalmacenId = currentPath.split('/')[2];
            // Ir al dashboard que muestra almacenes
            navigate('/dashboard-app');
          } else if (currentPath.includes('/subalmacenes/')) {
            // De subalmacenes → dashboard
            navigate('/dashboard-app');
          } else {
            // Fallback: usar historial del navegador
            if (canGoBack) {
              window.history.back();
            } else {
              navigate('/dashboard-app');
            }
          }
        });

        logger.log('✅ Capacitor backButton listener configurado');
      } catch (err) {
        logger.log('⚠️ Capacitor App no disponible (modo web):', err.message);
      }
    };

    setupBackButton();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [location.pathname, navigate]);

  // Prevenir zoom en inputs móviles
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
  }, []);

  return <>{children}</>;
};

export default MobileNavigationHandler;