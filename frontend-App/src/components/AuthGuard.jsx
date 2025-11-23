import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenManager, logger } from '../config/app-security.js';
import LoginFormWithRedirect from './LoginFormWithRedirect';

/**
 * Componente que verifica automáticamente si hay una sesión activa
 * y redirige al dashboard o muestra el login según corresponda
 */
export default function AuthGuard() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        logger.log('🔍 AuthGuard: Verificando sesión existente...');
        
        // Verificar si hay token guardado
        const token = tokenManager.get();
        if (!token) {
          logger.log('❌ AuthGuard: No hay token guardado');
          setShowLogin(true);
          setIsChecking(false);
          return;
        }

        // Verificar si el token es válido
        const isValid = tokenManager.isValid();
        if (!isValid) {
          logger.log('❌ AuthGuard: Token inválido o expirado');
          tokenManager.forceRemove();
          setShowLogin(true);
          setIsChecking(false);
          return;
        }

        // Verificar si hay sesión persistente (especialmente en móvil)
        const sessionPersistent = tokenManager.isSessionPersistent();
        const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
        const mobileSessionPersistent = localStorage.getItem('mobileSessionPersistent') === 'true';
        
        if (sessionPersistent || (isMobile && mobileSessionPersistent)) {
          logger.log('✅ AuthGuard: Sesión persistente encontrada, redirigiendo al dashboard');
          
          // Marcar sesión como activa
          localStorage.setItem('sessionActive', 'true');
          localStorage.setItem('lastActivity', Date.now().toString());
          
          // Redirigir al dashboard
          navigate('/dashboard-app', { replace: true });
          return;
        }

        // Si llegamos aquí, mostrar login
        logger.log('⚠️ AuthGuard: Sesión no persistente, mostrando login');
        setShowLogin(true);
        
      } catch (error) {
        logger.error('❌ AuthGuard: Error al verificar sesión:', error);
        setShowLogin(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

  // Mostrar loading mientras verifica
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no hay sesión activa
  if (showLogin) {
    return <LoginFormWithRedirect />;
  }

  // No debería llegar aquí, pero por seguridad
  return null;
}