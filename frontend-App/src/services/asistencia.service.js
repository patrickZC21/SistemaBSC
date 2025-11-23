import { buildApiUrl, tokenManager, logger, validators, apiRequest } from '../config/app-security.js';

// Crear nueva asistencia
export async function crearAsistencia(data) {
  const url = buildApiUrl('/api/asistencias');
  return await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Servicio para obtener asistencias reales por subalmacén y fecha
export async function getAsistenciasPorFecha(subalmacenId, fecha) {
  if (!validators.isValidId(subalmacenId) || !fecha) return [];
  
  logger.log('getAsistenciasPorFecha llamado con:', { subalmacenId, fecha });
  
  const url = buildApiUrl('/api/asistencias', {
    subalmacen_id: subalmacenId,
    fecha: fecha
  });
  
  try {
    const data = await apiRequest(url);
    logger.log('Asistencias obtenidas del backend:', data);
    return data || [];
  } catch (error) {
    logger.error('Error al obtener asistencias:', error);
    return [];
  }
}

// Validar formato HH:mm y evitar valores vacíos/nulos antes de enviar al backend
function isValidHourString(value) {
  return validators.isValidTimeFormat(value);
}

// Actualizar asistencia por id
export async function updateAsistencia(id, data) {
  if (!validators.isValidId(id)) {
    throw new Error('ID de asistencia inválido');
  }
  
  // Filtrar solo campos válidos y no vacíos
  const validData = {};
  
  if (typeof data.hora_entrada !== 'undefined') {
    validData.hora_entrada = isValidHourString(data.hora_entrada) 
      ? data.hora_entrada 
      : (data.hora_entrada === '' ? null : undefined);
  }
  
  if (typeof data.hora_salida !== 'undefined') {
    validData.hora_salida = isValidHourString(data.hora_salida) 
      ? data.hora_salida 
      : (data.hora_salida === '' ? null : undefined);
  }
  
  // Eliminar los undefined
  Object.keys(validData).forEach(k => validData[k] === undefined && delete validData[k]);
  
  if (Object.keys(validData).length === 0) {
    throw new Error('No hay datos válidos para actualizar');
  }
  
  const url = buildApiUrl(`/api/asistencias/${id}`);
  return await apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(validData)
  });
}
