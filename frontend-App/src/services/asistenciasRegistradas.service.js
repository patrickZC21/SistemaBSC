import { buildApiUrl, apiRequest, logger } from '../config/app-security.js';

// Servicio para obtener asistencias reales por subalmacén y fecha
export async function getAsistenciasRegistradas(subalmacenId, fecha) {
  try {
    const url = buildApiUrl('/api/asistencias', {
      subalmacen_id: subalmacenId,
      fecha: fecha
    });
    return await apiRequest(url);
  } catch (error) {
    logger.error('Error al obtener asistencias registradas:', error);
    return [];
  }
}
