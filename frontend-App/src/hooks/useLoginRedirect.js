import { useNavigate } from "react-router-dom";
import { tokenManager, logger } from '../config/app-security.js';

export function useLoginRedirect() {
  const navigate = useNavigate();
  
  return (data) => {
    try {
      // Validar que tenemos los datos necesarios
      if (!data) {
        logger.error('useLoginRedirect: No se recibieron datos');
        return;
      }
      
      if (!data.token) {
        logger.error('useLoginRedirect: No se recibió token');
        return;
      }
      
      // Guardar token
      const tokenSaved = tokenManager.set(data.token);
      if (!tokenSaved) {
        logger.error('useLoginRedirect: Error al guardar token');
        return;
      }
      
      // Log del usuario que inicia sesión
      if (data.usuario && data.usuario.correo) {
        logger.log('Usuario autenticado:', data.usuario.correo, 'Rol:', data.usuario.nombre_rol);
      }
      
      // Navegar al dashboard
      logger.log('Redirigiendo a dashboard-app');
      navigate("/dashboard-app", { replace: true });
      
    } catch (error) {
      logger.error('Error en useLoginRedirect:', error);
    }
  };
}
