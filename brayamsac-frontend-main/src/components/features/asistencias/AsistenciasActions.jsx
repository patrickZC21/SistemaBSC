import { Edit, Trash2 } from "lucide-react";
import React from "react";

export default function AsistenciasActions({ asistencia, onEditar, onEliminar }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        className="inline-flex items-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
        title="Editar"
        onClick={() => onEditar(asistencia)}
        type="button"
      >
        <Edit size={20} />
      </button>
      <button
        className="inline-flex items-center p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition"
        title="Eliminar"
        onClick={() => onEliminar(asistencia)}
        type="button"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}