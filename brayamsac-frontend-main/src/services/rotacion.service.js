import { buildApiUrl, tokenManager, logger } from '../config/security.js';

export const crearRotacionTrabajador = async ({ trabajador_id, subalmacen_id, fecha }, token) => {
  return fetch(buildApiUrl('/api/rotaciones'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ trabajador_id, subalmacen_id, fecha })
  });
};
