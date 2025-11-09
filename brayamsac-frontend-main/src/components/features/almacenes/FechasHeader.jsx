// src/components/FechasHeader.jsx
import React from "react";

const FechasHeader = ({
  almacenNombre,
  subalmacenNombre,
  onAgregarFechas,
}) => (
  <div className="flex justify-between items-center mb-4">
    <span className="text-gray-500 text-xl font-medium">
      Almacenes
      {almacenNombre && (
        <> / <span className="text-gray-700">{almacenNombre}</span></>
      )}
      {subalmacenNombre && (
        <> / <span className="text-gray-700">{subalmacenNombre}</span></>
      )}
    </span>
    <button
      className="cursor-pointer text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 mb-2"
      onClick={onAgregarFechas}
    >
      + Agregar fechas
    </button>
  </div>
);

export default FechasHeader;
