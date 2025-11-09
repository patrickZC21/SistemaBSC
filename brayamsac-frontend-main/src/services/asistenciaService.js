import { API_BASE_URL } from '../config/api.js';

/**
 * Servicio para gestión de asistencias
 */
export const asistenciaService = {
  /**
   * Actualiza una asistencia específica (versión simplificada sin debounce)
   * @param {string|number} id - ID de la asistencia
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async actualizarAsistencia(id, datos) {
    try {
      const token = localStorage.getItem('token');
      
      console.log('[asistenciaService] Enviando actualización:', {
        id,
        datos,
        url: `${API_BASE_URL}/api/asistencias/${id}`,
        token: token ? 'presente' : 'ausente'
      });
      
      const response = await fetch(`${API_BASE_URL}/api/asistencias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      });

      console.log('[asistenciaService] Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[asistenciaService] Error response:', errorText);
        
        let errorMessage = 'Error al actualizar asistencia';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[asistenciaService] Actualización exitosa:', result);
      return result;
    } catch (error) {
      console.error('[asistenciaService] Error en actualización:', error);
      throw error;
    }
  },

  /**
   * Obtiene una asistencia por ID
   * @param {string|number} id - ID de la asistencia
   * @returns {Promise<Object>} Datos de la asistencia
   */
  async obtenerAsistencia(id) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/api/asistencias/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener asistencia');
    }

    return await response.json();
  }
};

export default asistenciaService;
