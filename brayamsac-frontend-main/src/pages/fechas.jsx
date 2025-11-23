// src/pages/fechas.jsx
import React from "react";

// Layout y componentes UI
import AlmacenDropdown from "@/components/features/almacenes/AlmacenDropdown";
import BotonAgregarFechas from "@/components/features/almacenes/BotonAgregarFechas";
import FechasHeader from "@/components/features/almacenes/FechasHeader";
import FechasPorSubalmacen from "@/components/features/almacenes/FechasPorSubalmacen";
import SubAlmacenHeader from "@/components/features/almacenes/SubAlmacenHeader";
import SubAlmacenModal from "@/components/features/almacenes/SubAlmacenModal";
import SubAlmacenTable from "@/components/features/almacenes/SubAlmacenTable";
import MainLayout from "@/components/layout/MainLayout";

// Custom hooks
import { useFechasPorSubalmacen } from "../hooks/useFechasPorSubalmacen";
import { useNombresAlmacenSubalmacen } from "../hooks/useNombresAlmacenSubalmacen";

const PaginaFechas = ({ subalmacenId }) => {
  // --- Hooks de datos ---
  const {
    usuario,
    almacenNombre,
    subalmacenNombre,
  } = useNombresAlmacenSubalmacen(subalmacenId);

  const {
    fechas,
    loading,
    editandoId,
    nuevaFecha,
    busqueda,
    setBusqueda,
    agregando,
    fechasAgregar,
    setFechasAgregar,
    guardando,
    showConfirm,
    confirmarEliminacion,
    cancelarEliminacion,
    handleEditarClick,
    handleGuardarClick,
    handleCancelarClick,
    handleEliminarClick,
    abrirModalAgregar,
    cerrarModalAgregar,
    handleAgregarFechas,
  } = useFechasPorSubalmacen(subalmacenId);

  // --- Render ---
  return (
    <MainLayout usuario={usuario}>
      <div className="flex-1 p-6">
        {/* Encabezado y botón agregar modularizado */}
        <FechasHeader
          almacenNombre={almacenNombre}
          subalmacenNombre={subalmacenNombre}
          onAgregarFechas={abrirModalAgregar}
        />

        {/* Tabla de fechas */}
        <FechasPorSubalmacen
          fechas={fechas}
          subalmacenId={subalmacenId}      // <-- ESTA ES LA LÍNEA CORRECTIVA
          loading={loading}
          editandoId={editandoId}
          nuevaFecha={nuevaFecha}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          handleEditarClick={handleEditarClick}
          handleGuardarClick={handleGuardarClick}
          handleCancelarClick={handleCancelarClick}
          handleEliminarClick={handleEliminarClick}
          showConfirm={showConfirm}
          confirmarEliminacion={confirmarEliminacion}
          cancelarEliminacion={cancelarEliminacion}
        />

        {/* Modal agregar fechas como componente autocontenible */}
        <BotonAgregarFechas
          visible={agregando}
          onClose={cerrarModalAgregar}
          fechasAgregar={fechasAgregar}
          setFechasAgregar={setFechasAgregar}
          handleAgregarFechas={handleAgregarFechas}
          guardando={guardando}
        />
      </div>
    </MainLayout>
  );
};

export default PaginaFechas;
