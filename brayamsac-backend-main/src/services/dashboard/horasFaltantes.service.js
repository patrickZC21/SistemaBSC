import pool from '../../config/db.js';
import { executeQueryWithRetry } from '../../middleware/dbErrorHandler.js';

// Lógica para obtener el ranking de trabajadores con horas faltantes (optimizada)
// Corregido: usa programacion_fechas para filtrar por fecha (asistencias no tiene campo fecha directo)
export const obtenerHorasFaltantes = async () => {
  try {
    const query = `
      SELECT 
        t.nombre AS trabajador,
        a.nombre AS almacen,
        s.nombre AS subalmacen,
        t.horas_objetivo AS horas_asignadas,
        IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)), 0) / 3600 AS horas_trabajadas,
        GREATEST(t.horas_objetivo - (IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)), 0) / 3600), 0) AS horas_faltantes,
        t.activo
      FROM trabajadores t
      LEFT JOIN asistencias asi ON asi.trabajador_id = t.id 
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_salida IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
        AND asi.hora_salida != '00:00:00'
      LEFT JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
        AND pf.fecha >= CURDATE() - INTERVAL 30 DAY
      JOIN subalmacenes s ON t.subalmacen_id = s.id
      JOIN almacenes a ON s.almacen_id = a.id
      WHERE t.activo = 1
      GROUP BY t.id, t.nombre, a.nombre, s.nombre, t.horas_objetivo
      ORDER BY horas_trabajadas DESC
      LIMIT 10
    `;
    
    const rows = await executeQueryWithRetry(query, [], 2);
    return rows;
  } catch (error) {
    console.error('Error en consulta de horas faltantes:', error);
    throw new Error(`Error en base de datos: ${error.message}`);
  }
};

// Función alternativa con timeout más corto para casos críticos
export const obtenerHorasFaltantesRapido = async () => {
  try {
    const query = `
      SELECT 
        t.nombre AS trabajador,
        a.nombre AS almacen,
        s.nombre AS subalmacen,
        t.horas_objetivo AS horas_asignadas,
        IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)), 0) / 3600 AS horas_trabajadas,
        GREATEST(t.horas_objetivo - (IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)), 0) / 3600), 0) AS horas_faltantes
      FROM trabajadores t
      LEFT JOIN asistencias asi ON asi.trabajador_id = t.id 
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_salida IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
        AND asi.hora_salida != '00:00:00'
      LEFT JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
        AND pf.fecha >= CURDATE() - INTERVAL 7 DAY
      JOIN subalmacenes s ON t.subalmacen_id = s.id
      JOIN almacenes a ON s.almacen_id = a.id
      WHERE t.activo = 1
      GROUP BY t.id
      ORDER BY horas_trabajadas DESC
      LIMIT 5
    `;
    
    const rows = await executeQueryWithRetry(query, [], 1);
    return rows;
  } catch (error) {
    console.error('Error en consulta rápida de horas faltantes:', error);
    return [];
  }
};
