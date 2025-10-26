import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/security.js';

export const useTokenExpiration = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(buildApiUrl("/api/auth/logout"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Error al cerrar sesión automáticamente:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("nombre");
      localStorage.removeItem("rol");
      navigate("/loginSistema");
    }
  };

  useEffect(() => {
    // Verificar token cada 30 segundos
    const interval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/loginSistema");
        return;
      }

      try {
        const response = await fetch(buildApiUrl("/api/auth/validar"), {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Token inválido o expirado
          handleLogout();
        }
      } catch (error) {
        console.error("Error al validar token:", error);
        handleLogout();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [navigate]);

  return { handleLogout };
};
