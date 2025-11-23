/**
 * Utilidades para validación de fechas en la aplicación de asistencias
 */
import { logger } from '../config/app-security.js';

/**
 * Obtiene la fecha actual del sistema en la zona horaria local
 * @returns {string} - Fecha actual en formato YYYY-MM-DD
 */
export function obtenerFechaActual() {
  const ahora = new Date();
  
  // Usar la zona horaria local para obtener la fecha correcta
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  
  const fechaActual = `${año}-${mes}-${dia}`;
  
  logger.log('Fecha actual obtenida:', fechaActual);
  
  return fechaActual;
}

/**
 * Verifica si una fecha dada coincide con la fecha actual del sistema
 * @param {string} fechaStr - Fecha en formato YYYY-MM-DD o similar
 * @returns {boolean} - True si la fecha coincide con la fecha actual
 */
export function esFechaActual(fechaStr) {
  if (!fechaStr) {
    return false;
  }

  try {
    // Obtener la fecha actual usando zona horaria local
    const fechaActual = obtenerFechaActual();
    
    // Normalizar la fecha proporcionada
    let fechaNormalizada;
    if (fechaStr.includes('/')) {
      // Si viene en formato DD/MM/YYYY o MM/DD/YYYY, convertir
      const partes = fechaStr.split('/');
      if (partes.length === 3) {
        // Asumir formato DD/MM/YYYY
        fechaNormalizada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
    } else {
      // Si ya está en formato YYYY-MM-DD, validar y usar directamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        fechaNormalizada = fechaStr;
      } else {
        // Para otros formatos, usar Date con cuidado de zona horaria
        const fecha = new Date(fechaStr + 'T12:00:00'); // Añadir hora para evitar problemas de UTC
        if (!isNaN(fecha.getTime())) {
          const año = fecha.getFullYear();
          const mes = String(fecha.getMonth() + 1).padStart(2, '0');
          const dia = String(fecha.getDate()).padStart(2, '0');
          fechaNormalizada = `${año}-${mes}-${dia}`;
        }
      }
    }

    if (!fechaNormalizada) {
      logger.warn('No se pudo normalizar la fecha:', fechaStr);
      return false;
    }

    // Comparación final
    const sonIguales = fechaActual === fechaNormalizada;
    logger.log('Comparación de fechas:', { fechaActual, fechaNormalizada, sonIguales });

    return sonIguales;
  } catch (error) {
    logger.error('Error al validar fecha:', error);
    return false;
  }
}

/**
 * Formatea una fecha para mostrar en la UI
 * @param {string} fechaStr - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada como DD/MM/YYYY
 */
export function formatearFecha(fechaStr) {
  if (!fechaStr) {
    return '';
  }
  
  try {
    // Si ya viene en formato DD/MM/YYYY, devolverla tal como está
    if (fechaStr.includes('/') && fechaStr.split('/').length === 3) {
      return fechaStr;
    }
    
    // Si viene en formato YYYY-MM-DD, convertir a DD/MM/YYYY
    const [año, mes, dia] = fechaStr.split('-');
    
    // Validar que tenemos los componentes necesarios
    if (!año || !mes || !dia) {
      logger.warn('Componentes de fecha inválidos:', fechaStr);
      return fechaStr;
    }
    
    // Formatear directamente sin crear objeto Date para evitar problemas de zona horaria
    const fechaFormateada = `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${año}`;
    
    return fechaFormateada;
  } catch (error) {
    logger.error('Error al formatear fecha:', error);
    return fechaStr;
  }
}

/**
 * Obtiene información detallada de la fecha actual para debugging
 * @returns {object} - Objeto con información de la fecha actual
 */
export function obtenerInfoFechaActual() {
  const ahora = new Date();
  return {
    fechaCompleta: ahora.toString(),
    fechaISO: ahora.toISOString(),
    fechaLocal: ahora.toLocaleDateString('es-PE'),
    fechaNormalizada: obtenerFechaActual(),
    zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: ahora.getTime()
  };
}

/**
 * Mensaje de error para fechas no válidas
 */
export const MENSAJE_ERROR_FECHA = 'Solo se puede acceder a registrar asistencias en la fecha actual del sistema.';
