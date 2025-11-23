import { useEffect } from 'react';
import { buildApiUrl, tokenManager, apiRequest, logger } from '../config/app-security.js';

export function useTokenExpiration(onTokenExpired) {

  const logout = async () => {
    const token = tokenManager.get();
    if (token) {
      try {
        const url = buildApiUrl('/api/auth/logout');
        await apiRequest(url, { method: 'POST' });
      } catch (error) {
        logger.error('Error al hacer logout:', error);
      }
    }
    tokenManager.remove();
  };

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = tokenManager.get();
      if (!token) {
        onTokenExpired();
        return;
      }

      try {
        const url = buildApiUrl('/api/auth/validar');
        const response = await apiRequest(url);
        // Si llegamos aquí, el token es válido
        logger.log('Token validado correctamente');
      } catch (error) {
        // Token inválido o expirado
        logger.error('Error al validar token:', error);
        tokenManager.remove();
        onTokenExpired();
      }
    };

    // Verificar cada 30 segundos
    const interval = setInterval(checkTokenValidity, 30000);
    
    // Verificar inmediatamente al montar
    checkTokenValidity();

    return () => clearInterval(interval);
  }, [onTokenExpired]);

  return { logout };
};
