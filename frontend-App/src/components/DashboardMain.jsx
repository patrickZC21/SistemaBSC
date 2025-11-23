import React from "react";
import { useDashboardResumen } from "../hooks/useDashboardResumen";
import { useUsuario } from "../hooks/useUsuario";

export default function DashboardMain() {
  const { resumen, loading: loadingResumen, error: errorResumen } = useDashboardResumen();
  const { usuario, loading: loadingUsuario, error: errorUsuario } = useUsuario();

  if (loadingResumen || loadingUsuario) return <div className="p-8">Cargando...</div>;
  if (errorResumen || errorUsuario) return <div className="p-8 text-red-600">Error: {errorResumen || errorUsuario}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bienvenido, {usuario?.nombre} ({usuario?.nombre_rol})</h1>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Resumen</h2>
        <pre className="bg-gray-100 rounded p-4 text-sm overflow-x-auto">{JSON.stringify(resumen, null, 2)}</pre>
      </div>
      {Array.isArray(resumen?.almacenes) && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Almacenes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {resumen.almacenes.map((almacen) => (
              <div key={almacen.id} className="bg-white rounded-lg shadow flex flex-col items-center justify-center p-8">
                <div className="text-4xl">🏢</div>
                <span className="font-bold text-gray-500 text-base tracking-wide text-center mt-2">
                  {almacen.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
