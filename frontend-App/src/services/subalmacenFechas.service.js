// Servicio para obtener fechas de subalmacenes
import { buildApiUrl, apiRequest } from '../config/app-security.js';

export const getSubalmacenFechas = async (subalmacenId) => {
  const url = buildApiUrl('/api/fechas', { subalmacen_id: subalmacenId });
  return await apiRequest(url);
};
