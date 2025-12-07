import pool from '../../config/db.js';

/**
 * Obtiene métricas reales para las tarjetas del dashboard
 * - Tasa de Asistencia: % de trabajadores que registraron entrada hoy
 * - Duración Promedio: promedio de horas trabajadas por trabajador (últimos 7 días)
 * - Tasa de Cumplimiento: % de horas trabajadas vs horas objetivo (últimos 7 días)
 */
export const obtenerMetricasTarjetas = async () => {
  try {
    // Fecha actual en zona horaria de Perú (UTC-5) para evitar desfase con MySQL UTC
    const fechaHoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date()); // Formato: YYYY-MM-DD → "2026-04-18"

    // 🔍 DEBUG TEMPORAL - verificar qué fecha usa MySQL vs Node.js
    const [[mysqlDate]] = await pool.query(`SELECT CURDATE() as mysql_hoy, DATE(CONVERT_TZ(NOW(),'UTC','America/Lima')) as peru_hoy`);
    console.log(`🕐 DEBUG: Node="${fechaHoy}" | MySQL CURDATE="${mysqlDate.mysql_hoy}" | MySQL Peru="${mysqlDate.peru_hoy}"`);
    const [asisteHoy] = await pool.query(
      `SELECT asi.id, asi.trabajador_id, DATE(pf.fecha) as fecha, asi.hora_entrada FROM asistencias asi JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id ORDER BY pf.fecha DESC LIMIT 5`,
    );
    console.log(`🔍 DEBUG asistencias recientes: ${JSON.stringify(asisteHoy)}`);

    // 1. Tasa de Asistencia - % trabajadores con asistencia hoy vs total activos

    const [[asistenciaHoy]] = await pool.query(`
      SELECT 
        (SELECT COUNT(DISTINCT asi.trabajador_id) 
         FROM asistencias asi
         JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
         WHERE pf.fecha = ?
           AND asi.hora_entrada IS NOT NULL 
           AND asi.hora_entrada != '00:00:00'
        ) AS trabajadores_presentes,
        (SELECT COUNT(*) FROM trabajadores WHERE activo = 1) AS total_trabajadores
    `, [fechaHoy]);

    const presentes = parseInt(asistenciaHoy.trabajadores_presentes) || 0;
    const totalTrab = parseInt(asistenciaHoy.total_trabajadores) || 0;
    const tasaAsistencia = totalTrab > 0 ? (presentes / totalTrab) * 100 : 0;

    // Datos de asistencia de los últimos 7 días para el minigráfico
    const [asistenciaSemanal] = await pool.query(`
      SELECT 
        pf.fecha,
        COUNT(DISTINCT asi.trabajador_id) AS presentes,
        (SELECT COUNT(*) FROM trabajadores WHERE activo = 1) AS total
      FROM programacion_fechas pf
      LEFT JOIN asistencias asi ON asi.programacion_fecha_id = pf.id
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_entrada != '00:00:00'
      WHERE pf.fecha BETWEEN DATE_SUB(?, INTERVAL 6 DAY) AND ?
      GROUP BY pf.fecha
      ORDER BY pf.fecha ASC
    `, [fechaHoy, fechaHoy]);

    // Tasa de asistencia de ayer para comparación
    const [[asistenciaAyerRow]] = await pool.query(`
      SELECT COUNT(DISTINCT asi.trabajador_id) AS presentes_ayer
      FROM asistencias asi
      JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
      WHERE pf.fecha = DATE_SUB(?, INTERVAL 1 DAY)
        AND asi.hora_entrada IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
    `, [fechaHoy]);
    
    const presentesAyer = parseInt(asistenciaAyerRow.presentes_ayer) || 0;
    const tasaAyer = totalTrab > 0 ? (presentesAyer / totalTrab) * 100 : 0;
    const cambioAsistencia = parseFloat((tasaAsistencia - tasaAyer).toFixed(1));

    // 2. Duración Promedio de trabajo (últimos 7 días)
    const [[duracion]] = await pool.query(`
      SELECT 
        IFNULL(
          AVG(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)) / 3600, 
          0
        ) AS promedio_horas
      FROM asistencias asi
      JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
      WHERE pf.fecha BETWEEN DATE_SUB(?, INTERVAL 6 DAY) AND ?
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_salida IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
        AND asi.hora_salida != '00:00:00'
    `, [fechaHoy, fechaHoy]);

    const promedioActual = parseFloat(duracion.promedio_horas) || 0;

    // Duración promedio de la semana anterior para comparar
    const [[duracionAnterior]] = await pool.query(`
      SELECT 
        IFNULL(
          AVG(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)) / 3600, 
          0
        ) AS promedio_horas_anterior
      FROM asistencias asi
      JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
      WHERE pf.fecha BETWEEN DATE_SUB(?, INTERVAL 13 DAY) AND DATE_SUB(?, INTERVAL 7 DAY)
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_salida IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
        AND asi.hora_salida != '00:00:00'
    `, [fechaHoy, fechaHoy]);

    const promedioAnterior = parseFloat(duracionAnterior.promedio_horas_anterior) || 0;
    const cambioDuracion = promedioAnterior > 0
      ? parseFloat((((promedioActual - promedioAnterior) / promedioAnterior) * 100).toFixed(1))
      : 0;

    // Datos diarios de duración para minigráfico
    const [duracionSemanal] = await pool.query(`
      SELECT 
        pf.fecha,
        IFNULL(
          AVG(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)) / 3600, 
          0
        ) AS promedio_horas
      FROM programacion_fechas pf
      LEFT JOIN asistencias asi ON asi.programacion_fecha_id = pf.id
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_salida IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
        AND asi.hora_salida != '00:00:00'
      WHERE pf.fecha BETWEEN DATE_SUB(?, INTERVAL 6 DAY) AND ?
      GROUP BY pf.fecha
      ORDER BY pf.fecha ASC
    `, [fechaHoy, fechaHoy]);

    // 3. Tasa de Cumplimiento - horas trabajadas vs horas objetivo (últimos 7 días)
    const [[cumplimientoRow]] = await pool.query(`
      SELECT 
        IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)) / 3600, 0) AS total_horas_trabajadas,
        IFNULL(SUM(t.horas_objetivo), 0) AS total_horas_objetivo
      FROM trabajadores t
      LEFT JOIN asistencias asi ON asi.trabajador_id = t.id
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_salida IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
        AND asi.hora_salida != '00:00:00'
      LEFT JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
        AND pf.fecha BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()
      WHERE t.activo = 1
    `);

    const horasTrabajadas = parseFloat(cumplimientoRow.total_horas_trabajadas) || 0;
    const horasObjetivo = parseFloat(cumplimientoRow.total_horas_objetivo) || 0;
    const tasaCumplimiento = horasObjetivo > 0 ? (horasTrabajadas / horasObjetivo) * 100 : 0;

    // Cumplimiento de la semana anterior
    const [[cumplimientoAntRow]] = await pool.query(`
      SELECT 
        IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)) / 3600, 0) AS total_horas_trabajadas,
        IFNULL(SUM(t.horas_objetivo), 0) AS total_horas_objetivo
      FROM trabajadores t
      LEFT JOIN asistencias asi ON asi.trabajador_id = t.id
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_salida IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
        AND asi.hora_salida != '00:00:00'
      LEFT JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
        AND pf.fecha BETWEEN CURDATE() - INTERVAL 13 DAY AND CURDATE() - INTERVAL 7 DAY
      WHERE t.activo = 1
    `);

    const horasTrabajadasAnt = parseFloat(cumplimientoAntRow.total_horas_trabajadas) || 0;
    const horasObjetivoAnt = parseFloat(cumplimientoAntRow.total_horas_objetivo) || 0;
    const tasaCumplimientoAnt = horasObjetivoAnt > 0 ? (horasTrabajadasAnt / horasObjetivoAnt) * 100 : 0;
    const cambioCumplimiento = parseFloat((tasaCumplimiento - tasaCumplimientoAnt).toFixed(1));

    // Cumplimiento diario para minigráfico
    const [cumplimientoDiario] = await pool.query(`
      SELECT 
        pf.fecha,
        IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)) / 3600, 0) AS horas_dia
      FROM programacion_fechas pf
      LEFT JOIN asistencias asi ON asi.programacion_fecha_id = pf.id
        AND asi.hora_entrada IS NOT NULL 
        AND asi.hora_salida IS NOT NULL
        AND asi.hora_entrada != '00:00:00'
        AND asi.hora_salida != '00:00:00'
      WHERE pf.fecha BETWEEN DATE_SUB(?, INTERVAL 6 DAY) AND ?
      GROUP BY pf.fecha
      ORDER BY pf.fecha ASC
    `, [fechaHoy, fechaHoy]);

    // Formatear fechas a strings simples YYYY-MM-DD
    const formatFecha = (f) => {
      if (f instanceof Date) return f.toISOString().split('T')[0];
      if (typeof f === 'string') return f.split('T')[0];
      return String(f);
    };

    return {
      asistencia: {
        tasa: parseFloat(tasaAsistencia.toFixed(1)),
        presentes,
        total: totalTrab,
        cambio: cambioAsistencia,
        semanal: asistenciaSemanal.map(d => ({
          fecha: formatFecha(d.fecha),
          tasa: parseInt(d.total) > 0 ? parseFloat(((parseInt(d.presentes) / parseInt(d.total)) * 100).toFixed(1)) : 0
        }))
      },
      duracion: {
        promedio: parseFloat(promedioActual.toFixed(1)),
        cambio: cambioDuracion,
        semanal: duracionSemanal.map(d => ({
          fecha: formatFecha(d.fecha),
          horas: parseFloat(parseFloat(d.promedio_horas).toFixed(1))
        }))
      },
      cumplimiento: {
        tasa: parseFloat(tasaCumplimiento.toFixed(1)),
        horasTrabajadas: parseFloat(horasTrabajadas.toFixed(1)),
        horasObjetivo: parseFloat(horasObjetivo.toFixed(1)),
        cambio: cambioCumplimiento,
        semanal: cumplimientoDiario.map(d => ({
          fecha: formatFecha(d.fecha),
          horas: parseFloat(parseFloat(d.horas_dia).toFixed(1))
        }))
      }
    };
  } catch (error) {
    console.error('Error en obtenerMetricasTarjetas:', error.message, error.stack);
    throw error;
  }
};
