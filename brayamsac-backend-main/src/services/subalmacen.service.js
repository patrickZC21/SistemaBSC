import pool from '../config/db.js';

// Crear subalmacén
export const crearSubalmacen = async (nombre, almacen_id, refrigerio = null, jornada = null) => {
  const [result] = await pool.query(
    'INSERT INTO subalmacenes (nombre, almacen_id, refrigerio, jornada) VALUES (?, ?, ?, ?)',
    [nombre, almacen_id, refrigerio, jornada]
  );
  return { id: result.insertId, nombre, almacen_id, refrigerio, jornada };
};

// Listar subalmacenes
export const listarSubalmacenes = async () => {
  const [rows] = await pool.query('SELECT * FROM subalmacenes');
  return rows;
};

// Listar subalmacenes filtrados por almacen_id
export const listarSubalmacenesPorAlmacen = async (almacen_id) => {
  const [rows] = await pool.query('SELECT * FROM subalmacenes WHERE almacen_id = ?', [almacen_id]);
  return rows;
};

// Obtener subalmacén por ID
export const obtenerSubalmacen = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM subalmacenes WHERE id = ?', [id]
  );
  return rows[0];
};

// Obtener info de subalmacén y su almacén asociado
export const obtenerInfoSubalmacen = async (id) => {
  // Unir subalmacenes y almacenes para obtener toda la información incluyendo las nuevas columnas
  const [rows] = await pool.query(
    `SELECT s.nombre AS subalmacen, a.nombre AS almacen, s.refrigerio, s.jornada
     FROM subalmacenes s
     JOIN almacenes a ON s.almacen_id = a.id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0];
};

// Actualizar subalmacén
export const actualizarSubalmacen = async (id, nombre, almacen_id, refrigerio = null, jornada = null) => {
  const [result] = await pool.query(
    'UPDATE subalmacenes SET nombre = ?, almacen_id = ?, refrigerio = ?, jornada = ? WHERE id = ?',
    [nombre, almacen_id, refrigerio, jornada, id]
  );
  return result.affectedRows;
};

// Eliminar subalmacén (con limpieza de dependencias)
export const eliminarSubalmacen = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Eliminar asistencias vinculadas a programacion_fechas de este subalmacén
    try {
      await connection.query(
        `DELETE a FROM asistencias a 
         INNER JOIN programacion_fechas pf ON a.programacion_fecha_id = pf.id 
         WHERE pf.subalmacen_id = ?`, [id]
      );
    } catch (e) { console.log('Nota: tabla asistencias/programacion_fechas -', e.message); }

    // 2. Eliminar programacion_fechas del subalmacén
    try {
      await connection.query(
        'DELETE FROM programacion_fechas WHERE subalmacen_id = ?', [id]
      );
    } catch (e) { console.log('Nota: tabla programacion_fechas -', e.message); }

    // 3. Eliminar rotaciones vinculadas a trabajadores de este subalmacén (si existe la tabla)
    try {
      await connection.query(
        `DELETE r FROM rotaciones r 
         INNER JOIN trabajadores t ON r.trabajador_id = t.id 
         WHERE t.subalmacen_id = ?`, [id]
      );
    } catch (e) { console.log('Nota: tabla rotaciones -', e.message); }

    // 4. Eliminar asignaciones de usuario-almacén (si existe la tabla)
    try {
      await connection.query(
        'DELETE FROM usuario_almacenes WHERE subalmacen_id = ?', [id]
      );
    } catch (e) { console.log('Nota: tabla usuario_almacenes -', e.message); }

    // 5. Eliminar trabajadores del subalmacén
    try {
      await connection.query(
        'DELETE FROM trabajadores WHERE subalmacen_id = ?', [id]
      );
    } catch (e) { console.log('Nota: tabla trabajadores -', e.message); }

    // 6. Finalmente, eliminar el subalmacén
    const [result] = await connection.query(
      'DELETE FROM subalmacenes WHERE id = ?', [id]
    );

    await connection.commit();
    console.log(`✅ Subalmacén ${id} eliminado con todas sus dependencias`);
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    console.error(`❌ Error eliminando subalmacén ${id}:`, error.message);
    throw error;
  } finally {
    connection.release();
  }
};
