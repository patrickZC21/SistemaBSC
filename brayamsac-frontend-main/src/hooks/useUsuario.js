import { useEffect, useState, useRef } from "react";
import { buildApiUrl } from '../config/security.js';

// Cache global para evitar múltiples validaciones
const userCache = {
  data: null,
  timestamp: 0,
  isValidating: false
};
const CACHE_DURATION = 60000; // 1 minuto

export function useUsuario(subalmacenId, fecha) {
  const [usuario, setUsuario] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUsuario(null);
      console.log("[useUsuario] No hay token, usuario no autenticado");
      return;
    }

    // Verificar cache primero
    const now = Date.now();
    if (userCache.data && (now - userCache.timestamp) < CACHE_DURATION) {
      console.log("[useUsuario] Usando datos del cache");
      if (isMountedRef.current) {
        setUsuario(userCache.data);
      }
      return;
    }

    // Evitar múltiples validaciones simultáneas
    if (userCache.isValidating) {
      console.log("[useUsuario] Validación ya en progreso, esperando...");
      const checkValidation = setInterval(() => {
        if (!userCache.isValidating && isMountedRef.current) {
          setUsuario(userCache.data);
          clearInterval(checkValidation);
        }
      }, 100);
      return;
    }

    userCache.isValidating = true;
    console.log("[useUsuario] Validando token...");
    
    fetch(buildApiUrl("/api/auth/validar"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        userCache.data = data.usuario;
        userCache.timestamp = Date.now();
        console.log("[useUsuario] Usuario validado:", data.usuario);
        if (isMountedRef.current) {
          setUsuario(data.usuario);
        }
      })
      .catch((error) => {
        console.log("[useUsuario] Error validando usuario:", error.message);
        userCache.data = null;
        userCache.timestamp = 0;
        if (isMountedRef.current) {
          setUsuario(null);
        }
      })
      .finally(() => {
        userCache.isValidating = false;
      });
  }, []); // Removemos las dependencias para evitar re-validaciones innecesarias

  return usuario;
}