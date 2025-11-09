import { X } from "lucide-react";
import React, { useState } from "react";

const BotonAgregarFechas = ({
  visible,
  onClose,
  fechasAgregar,
  setFechasAgregar,
  handleAgregarFechas,
  guardando,
}) => {
  const [fechaTemp1, setFechaTemp1] = useState("");
  const [fechaTemp2, setFechaTemp2] = useState("");

  if (!visible) return null;

  const agregarFechaTemp = (fecha) => {
    if (fecha && !fechasAgregar.includes(fecha)) {
      setFechasAgregar([...fechasAgregar, fecha]);
    }
  };

  function getFechasRango(fechaInicio, fechaFin) {
    const fechas = [];
    const actual = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    while (actual <= fin) {
      fechas.push(actual.toISOString().slice(0, 10));
      actual.setDate(actual.getDate() + 1);
    }
    return fechas;
  }

  const handleGuardarTodas = () => {
    let fechasAEnviar = [];
    if (fechaTemp1 && fechaTemp2) {
      fechasAEnviar = getFechasRango(fechaTemp1, fechaTemp2);
    } else if (fechaTemp1) {
      fechasAEnviar = [fechaTemp1];
    } else if (fechaTemp2) {
      fechasAEnviar = [fechaTemp2];
    }
    fechasAEnviar = fechasAEnviar.filter((f) => !fechasAgregar.includes(f));
    setFechasAgregar([...fechasAgregar, ...fechasAEnviar]);
    setFechaTemp1("");
    setFechaTemp2("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={() => {
            setFechasAgregar([]);
            setFechaTemp1("");
            setFechaTemp2("");
            onClose && onClose();
          }}
        >
          <X size={28} />
        </button>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-center mb-2">Agregar fechas</h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fechaTemp1}
              onChange={(e) => setFechaTemp1(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <input
              type="date"
              value={fechaTemp2}
              onChange={(e) => setFechaTemp2(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          {fechasAgregar.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fechasAgregar.map((f, idx) => (
                <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {new Date(`${f  }T00:00:00`).toLocaleDateString("es-ES")}
                  <button
                    className="ml-1 text-red-500"
                    onClick={() => setFechasAgregar(fechasAgregar.filter((ff) => ff !== f))}
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <button
            className="mt-2 bg-gray-800 text-white rounded-full px-4 py-2 w-full"
            onClick={handleGuardarTodas}
            disabled={!fechaTemp1 && !fechaTemp2}
          >
            Agregar a la lista
          </button>
          {fechasAgregar.length > 0 && (
            <button
              className="mt-2 bg-gray-800 text-white rounded-full px-4 py-2 w-full"
              onClick={handleAgregarFechas}
              disabled={fechasAgregar.length === 0 || guardando}
            >
              {guardando ? "Guardando..." : "Guardar todas en la base de datos"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotonAgregarFechas;
