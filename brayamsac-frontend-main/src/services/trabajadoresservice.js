import { buildApiUrl, tokenManager, logger } from '../config/security.js';

const API_URL = buildApiUrl('/api/trabajadores');

export const crearTrabajador = async (body, token) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    logger.log('Trabajador creado:', response.status);
    return response;
  } catch (error) {
    logger.error('Error al crear trabajador:', error);
    throw error;
  }
};

export const editarTrabajador = async (id, body, token) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    logger.log('Trabajador editado:', response.status);
    return response;
  } catch (error) {
    logger.error('Error al editar trabajador:', error);
    throw error;
  }
};

export const toggleActivoTrabajador = async (id, activo, token) => {
  try {
    const response = await fetch(`${API_URL}/${id}/activar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ activo })
    });
    logger.log('Estado de trabajador actualizado:', response.status);
    return response;
  } catch (error) {
    logger.error('Error al actualizar estado de trabajador:', error);
    throw error;
  }
};

export async function eliminarTrabajador(id, token) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    logger.log('Trabajador eliminado:', response.status);
    return response;
  } catch (error) {
    logger.error('Error al eliminar trabajador:', error);
    throw error;
  }
}
