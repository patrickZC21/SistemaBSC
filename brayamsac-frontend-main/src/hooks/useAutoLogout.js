// Hook para manejar sesión persistente (sin logout automático al cerrar pestaña)
import { useEffect } from 'react';
import { buildApiUrl } from '../config/security.js';

export const useAutoLogout = () => {
  useEffect(() => {
    // Función para manejar logout manual solamente
    const performManualLogout = async (token) => {
      if (!token) return;
      
      try {
        await fetch(buildApiUrl("/api/auth/logout"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.error("Error en logout manual:", error);
      }
    };

    // Detectar cambios de visibilidad para posible logout por inactividad prolongada
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // La página se ocultó, pero NO hacemos logout automático
        // La sesión se mantiene activa para cuando el usuario regrese
        console.log('Página oculta - sesión mantenida');
      } else {
        // La página volvió a ser visible
        console.log('Página visible - sesión activa');
      }
    };

    // Solo registrar el listener de visibilidad (sin logout automático)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup en unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Función para logout manual que pueden usar los componentes
  const manualLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(buildApiUrl("/api/auth/logout"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.error("Error en logout manual:", error);
      } finally {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }
  };

  return { manualLogout };
};

export default useAutoLogout;
