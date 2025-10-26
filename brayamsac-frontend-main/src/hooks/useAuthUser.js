// Hook centralizado para manejo de usuario autenticado
import { useEffect, useState, useRef } from "react";
import { buildApiUrl } from '../config/security.js';
import { rateLimitedFetch } from '../utils/rateLimiter.js';

// Cache global compartido para evitar múltiples validaciones
let globalUserCache = {
  data: null,
  timestamp: 0,
  isValidating: false,
  subscribers: new Set()
};

const CACHE_DURATION = 60000; // 1 minuto
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Función para notificar a todos los suscriptores
const notifySubscribers = (userData) => {
  globalUserCache.subscribers.forEach(callback => {
    try {
      callback(userData);
    } catch (error) {
      console.error('[useAuthUser] Error notificando suscriptor:', error);
    }
  });
};

// Función para validar token con reintentos
const validateTokenWithRetry = async (token, retries = 0) => {
  try {
    const response = await rateLimitedFetch(buildApiUrl("/api/auth/validar"), {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Agregar timeout para evitar requests colgados
      signal: AbortSignal.timeout(10000)
    });

    if (response.status === 429) {
      // Si es 429, esperar más tiempo antes de reintentar
      if (retries < MAX_RETRIES) {
        console.warn(`[useAuthUser] Rate limit alcanzado, reintentando en ${RETRY_DELAY * (retries + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retries + 1)));
        return validateTokenWithRetry(token, retries + 1);
      }
      throw new Error('Rate limit exceeded');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (retries < MAX_RETRIES && error.name !== 'AbortError') {
      console.warn(`[useAuthUser] Error en validación, reintentando... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return validateTokenWithRetry(token, retries + 1);
    }
    throw error;
  }
};

export function useAuthUser() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const updateUser = (userData) => {
      if (isMountedRef.current) {
        setUsuario(userData);
        setLoading(false);
        setError(null);
      }
    };

    // Suscribirse a cambios globales
    globalUserCache.subscribers.add(updateUser);

    const validateUser = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("[useAuthUser] No hay token disponible");
        globalUserCache.data = null;
        globalUserCache.timestamp = 0;
        notifySubscribers(null);
        return;
      }

      // Verificar cache primero
      const now = Date.now();
      if (globalUserCache.data && (now - globalUserCache.timestamp) < CACHE_DURATION) {
        console.log("[useAuthUser] Usando datos del cache global");
        updateUser(globalUserCache.data);
        return;
      }

      // Evitar múltiples validaciones simultáneas
      if (globalUserCache.isValidating) {
        console.log("[useAuthUser] Validación ya en progreso, esperando resultado...");
        
        // Esperar a que termine la validación actual
        const checkValidation = setInterval(() => {
          if (!globalUserCache.isValidating) {
            clearInterval(checkValidation);
            updateUser(globalUserCache.data);
          }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => {
          clearInterval(checkValidation);
          if (globalUserCache.isValidating) {
            console.warn("[useAuthUser] Timeout esperando validación");
            globalUserCache.isValidating = false;
          }
        }, 15000);
        
        return;
      }

      globalUserCache.isValidating = true;
      setLoading(true);
      setError(null);
      
      console.log("[useAuthUser] Iniciando validación de token...");
      
      try {
        const data = await validateTokenWithRetry(token);
        
        globalUserCache.data = data.usuario;
        globalUserCache.timestamp = Date.now();
        
        console.log("[useAuthUser] Usuario validado exitosamente:", data.usuario?.nombre || 'Usuario');
        notifySubscribers(data.usuario);
        
      } catch (error) {
        console.error("[useAuthUser] Error validando usuario:", error.message);
        
        globalUserCache.data = null;
        globalUserCache.timestamp = 0;
        
        if (isMountedRef.current) {
          setError(error.message);
        }
        
        notifySubscribers(null);
        
        // Si es error de autenticación, limpiar token
        if (error.message.includes('401') || error.message.includes('403')) {
          localStorage.removeItem('token');
          console.log("[useAuthUser] Token inválido removido");
        }
        
      } finally {
        globalUserCache.isValidating = false;
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    validateUser();

    // Cleanup: desuscribirse al desmontar
    return () => {
      globalUserCache.subscribers.delete(updateUser);
    };
  }, []);

  // Función para forzar revalidación
  const revalidate = () => {
    globalUserCache.data = null;
    globalUserCache.timestamp = 0;
    globalUserCache.isValidating = false;
    
    const token = localStorage.getItem("token");
    if (token) {
      // Trigger revalidation
      setLoading(true);
      setError(null);
    }
  };

  return { 
    usuario, 
    loading, 
    error, 
    revalidate,
    isAuthenticated: !!usuario && !!localStorage.getItem('token')
  };
}

// Hook simplificado para casos donde solo se necesita el usuario
export function useUser() {
  const { usuario } = useAuthUser();
  return usuario;
}

// Función para limpiar cache manualmente (útil para logout)
export const clearUserCache = () => {
  globalUserCache.data = null;
  globalUserCache.timestamp = 0;
  globalUserCache.isValidating = false;
  notifySubscribers(null);
  console.log("[useAuthUser] Cache de usuario limpiado");
};