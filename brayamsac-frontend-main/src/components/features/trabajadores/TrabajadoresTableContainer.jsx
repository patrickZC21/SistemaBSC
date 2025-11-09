import React from 'react';

import { getAlmacenNombre, getSubalmacenNombre, getCoordinadorNombre } from './helpers';
import TrabajadoresTable from './Trabajadorestable';

export default function TrabajadoresTableContainer({
  loading,
  trabajadores,
  almacenes,
  subalmacenes,
  coordinadores,
  onEdit,
  onToggleActivo,
  onEliminar, // <-- AGREGA ESTA LÍNEA
  navigate
}) {
  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="p-6 text-center">Cargando...</div>
      ) : (
        <TrabajadoresTable
          trabajadores={trabajadores}
          getAlmacenNombre={id => getAlmacenNombre(almacenes, id)}
          getSubalmacenNombre={id => getSubalmacenNombre(subalmacenes, id)}
          getCoordinadorNombre={id => getCoordinadorNombre(coordinadores, id)}
          onEdit={onEdit}
          onToggleActivo={onToggleActivo}
          onEliminar={onEliminar} // <-- AGREGA ESTA LÍNEA
          navigate={navigate}
        />
      )}
    </div>
  );
}