import { UserPlus } from 'lucide-react';
import React from "react";

export default function AsistenciasHeader({ nombreAlmacen, nombreSubalmacen, fecha, onAgregarRotacion }) {
  return (
    <>
      <div className="text-gray-500 text-lg mb-1">
        Almacenes
        {nombreAlmacen && <> / <span className="font-semibold">{nombreAlmacen}</span></>}
        {nombreSubalmacen && <> / <span className="font-bold">{nombreSubalmacen}</span></>}
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Asistencias del {fecha}</h2>
        <button
          className="flex items-center bg-gray-800 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-900 transition ml-4 font-medium text-lg cursor-pointer hover:scale-105 active:scale-95 focus:outline-none"
          onClick={onAgregarRotacion ? onAgregarRotacion : () => {}}
        >
          <UserPlus className="w-6 h-6 mr-2 transition-transform duration-200" />
          Agregar Trabajador
        </button>
      </div>
    </>
  );
}