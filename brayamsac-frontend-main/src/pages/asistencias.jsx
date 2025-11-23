import React, { useState } from "react";

import AgregarRotacionModal from "@/components/features/asistencias/AgregarRotacionModal";
import AsistenciasHeader from "@/components/features/asistencias/AsistenciasHeader";

export default function AsistenciasPage({ nombreAlmacen, nombreSubalmacen, subalmacenActualId, fecha, onAgregarTrabajador }) {
  // Estado para mostrar el modal
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-6">
      <AsistenciasHeader
        nombreAlmacen={nombreAlmacen}
        nombreSubalmacen={nombreSubalmacen}
        fecha={fecha}
        onAgregarRotacion={() => setModalOpen(true)}
      />
      {/* Aquí iría la tabla de asistencias y el modal */}
      {/* <AsistenciasTable ... /> */}
      <AgregarRotacionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        subalmacenActualId={subalmacenActualId}
        onAgregar={onAgregarTrabajador}
      />
    </div>
  );
}