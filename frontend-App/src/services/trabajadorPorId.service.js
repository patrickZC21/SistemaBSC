import { buildApiUrl, apiRequest, logger } from '../config/app-security.js';

// Servicio para obtener datos de un trabajador por su ID
export async function getTrabajadorPorId(id) {
  if (!id) return null;
  try {
    const url = buildApiUrl(`/api/trabajadores/${id}`);
    const data = await apiRequest(url);
    // Si no tiene nombre o dni, no es válido
    if (!data || !data.nombre || !data.dni) return null;
    return data;
  } catch (error) {
    logger.error('Error al obtener trabajador por ID:', error);
    return null;
  }
}
