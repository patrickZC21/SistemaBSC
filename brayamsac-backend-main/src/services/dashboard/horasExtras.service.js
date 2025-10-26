import pool from '../../config/db.js';

// Lógica para obtener el ranking de horas extras (corregida)
// Usa programacion_fechas para filtrar por fecha (asistencias no tiene campo fecha directo)
export const obtenerHorasExtras = async () => {
  const [rows] = await pool.query(`
    SELECT 
      t.id,
      t.nombre,
      a.nombre AS almacen,
      s.nombre AS subalmacen,
      t.horas_objetivo,
      IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)), 0) / 3600 AS horas_trabajadas,
      GREATEST(
        (IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)), 0) / 3600) - t.horas_objetivo, 
        0
      ) AS horas_extra
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
    HAVING horas_extra > 0
    ORDER BY horas_extra DESC
    LIMIT 8
  `);
  return rows;
};
