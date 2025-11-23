import { buildApiUrl, apiRequest, logger } from '../config/app-security.js';

// Servicio para obtener datos reales de subalmacen y almacen desde el backend
export async function getInfoAlmacenSubalmacen(subalmacenId) {
  if (!subalmacenId) return { almacen: '', subalmacen: '' };
  try {
    const url = buildApiUrl(`/api/subalmacenes/${subalmacenId}/info`);
    const data = await apiRequest(url);
    // Se espera que el backend retorne { almacen: 'Nombre Almacen', subalmacen: 'Nombre Subalmacen' }
    return data;
  } catch (error) {
    logger.error('Error al obtener info de almacén/subalmacén:', error);
    // Si hay error, retorna vacío o valores por defecto
    return { almacen: '', subalmacen: '' };
  }
}
