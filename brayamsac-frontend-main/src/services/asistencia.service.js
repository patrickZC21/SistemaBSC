import { buildApiUrl, tokenManager, logger } from '../config/security.js';

export const eliminarAsistencia = async (id, token) => {
  logger.log('[eliminarAsistencia] Token enviado:', token);
  return fetch(buildApiUrl(`/api/asistencias/${id}`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};
