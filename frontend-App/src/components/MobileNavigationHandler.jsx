import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logger } from '../config/app-security.js';

/**
 * Componente para manejar la navegación móvil de manera más amigable
 * Evita comportamientos inesperados en dispositivos Android
 */
const MobileNavigationHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Detectar si es un dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      logger.log('Dispositivo móvil detectado - configurando navegación optimizada');
      
      // Prevenir zoom accidental en inputs
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Manejar el botón de retroceso del navegador de manera más suave
      const handlePopState = (event) => {
        logger.log('Navegación hacia atrás detectada en móvil');
        
        // Permitir navegación normal, pero con logging para debug
        const currentPath = location.pathname;
        logger.log('Navegando desde:', currentPath);
        
        // Si estamos en la página de login, prevenir navegación hacia atrás
        if (currentPath === '/' || currentPath === '/login') {
          event.preventDefault();
          logger.log('Prevenido retroceso desde página de login');
          return false;
        }
      };
      
      // Agregar listener para popstate
      window.addEventListener('popstate', handlePopState);
      
      // Cleanup
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [location.pathname]);

  // Manejar orientación de pantalla en móviles
  useEffect(() => {
    const handleOrientationChange = () => {
      // Pequeño delay para que el navegador se ajuste
      setTimeout(() => {
        // Solo hacer scroll a top si no hay operaciones de asistencia activas
        const hasActiveAssistanceOperations = sessionStorage.getItem('hasUnsavedData') === 'true';
        if (!hasActiveAssistanceOperations) {
          window.scrollTo(0, 0);
          logger.log('Orientación cambiada - viewport ajustado');
        } else {
          logger.log('Orientación cambiada - scroll preservado por operaciones activas');
        }
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Prevenir comportamientos no deseados en móviles
  useEffect(() => {
    // Prevenir selección de texto accidental
    const preventTextSelection = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    // Prevenir menú contextual en elementos que no lo necesitan
    const preventContextMenu = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    // Solo aplicar en dispositivos móviles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      document.addEventListener('selectstart', preventTextSelection);
      document.addEventListener('contextmenu', preventContextMenu);
      
      return () => {
        document.removeEventListener('selectstart', preventTextSelection);
        document.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, []);

  return <>{children}</>;
};

export default MobileNavigationHandler;