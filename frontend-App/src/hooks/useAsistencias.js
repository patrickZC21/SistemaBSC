import { useState, useEffect } from "react";
import { logger } from "../config/app-security.js";
import { getAsistenciasPorFecha } from "../services/asistencia.service";
import { getTrabajadorPorId } from "../services/trabajadorPorId.service";
import { useSubalmacenFechas } from "./useSubalmacenFechas";

export default function useAsistencias(subalmacenId) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [trabajadores, setTrabajadores] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const { fechas = [] } = useSubalmacenFechas(subalmacenId);

  const seleccionarFecha = (fecha) => {
    setFechaSeleccionada(fecha);
  };

  // Consulta real y sincroniza trabajadores
  const cargarAsistencias = async (fecha) => {
    logger.log('cargarAsistencias llamado con fecha:', fecha, 'subalmacenId:', subalmacenId);
    if (!subalmacenId || !fecha) {
      setAsistencias([]);
      setTrabajadores([]);
      return [];
    }
    const data = await getAsistenciasPorFecha(subalmacenId, fecha);
    logger.log('Datos recibidos en cargarAsistencias:', data);
    setAsistencias(data || []);
    // Derivar trabajadores únicos de las asistencias
    if (Array.isArray(data)) {
      const trabajadoresUnicos = [];
      const ids = new Set();
      data.forEach((a) => {
        if (
          a.trabajador_id &&
          a.trabajador_nombre &&
          !ids.has(a.trabajador_id)
        ) {
          trabajadoresUnicos.push({
            id: a.trabajador_id,
            nombre: a.trabajador_nombre,
            dni: a.trabajador_dni || "",
          });
          ids.add(a.trabajador_id);
        }
      });
      setTrabajadores(trabajadoresUnicos);
      logger.log('Trabajadores únicos derivados:', trabajadoresUnicos);
    } else {
      setTrabajadores([]);
    }
    return data;
  };

  return {
    fechas,
    trabajadores,
    asistencias,
    fechaSeleccionada,
    seleccionarFecha,
    cargarAsistencias,
  };
}
