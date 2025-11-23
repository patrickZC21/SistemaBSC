import React, { useState, useEffect } from "react";
import FechasList from "../components/FechasList";
import TrabajadoresAsistencia from "../components/TrabajadoresAsistencia";
import useAsistencias from "../hooks/useAsistencias";

const AsistenciasPage = () => {
  const { fechas, trabajadores, fechaSeleccionada, seleccionarFecha, cargarAsistencias } = useAsistencias();
  const [asistencias, setAsistencias] = useState([]);

  // Cargar asistencias reales al seleccionar fecha
  useEffect(() => {
    if (fechaSeleccionada) {
      cargarAsistencias(fechaSeleccionada).then(data => {
        if (data) setAsistencias(data);
      });
    }
  }, [fechaSeleccionada]);

  // Función para refrescar asistencias tras guardar
  const refreshAsistencias = () => {
    if (fechaSeleccionada) {
      cargarAsistencias(fechaSeleccionada).then(data => {
        if (data) setAsistencias(data);
      });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Almacen \\ Subalmacen \\ Fechas</h2>
      <FechasList fechas={fechas} onSelect={seleccionarFecha} fechaSeleccionada={fechaSeleccionada} />
      {fechaSeleccionada && (
        <TrabajadoresAsistencia trabajadores={trabajadores} asistencias={asistencias} onRefreshAsistencias={refreshAsistencias} />
      )}
    </div>
  );
};

export default AsistenciasPage;
