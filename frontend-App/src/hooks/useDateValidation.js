import { useMemo } from 'react';
import { esFechaActual, obtenerFechaActual, MENSAJE_ERROR_FECHA } from '../utils/dateValidation';

/**
 * Hook personalizado para validar el acceso a fechas de asistencias
 * @param {string} fecha - Fecha a validar en formato YYYY-MM-DD
 * @returns {object} - Objeto con información de validación
 */
export function useDateValidation(fecha) {
  const validacion = useMemo(() => {
    if (!fecha) {
      return {
        esValida: false,
        mensaje: 'No se ha proporcionado una fecha válida.',
        fechaActual: obtenerFechaActual(),
        puedeAcceder: false
      };
    }

    const esValida = esFechaActual(fecha);
    
    return {
      esValida,
      mensaje: esValida ? '' : MENSAJE_ERROR_FECHA,
      fechaActual: obtenerFechaActual(),
      puedeAcceder: esValida,
      fechaSeleccionada: fecha
    };
  }, [fecha]);

  return validacion;
}
