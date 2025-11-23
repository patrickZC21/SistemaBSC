import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUsuario } from "../hooks/useUsuario";
import { useSubalmacenesAsignadosByAlmacen } from "../hooks/useSubalmacenesAsignadosByAlmacen";
import UserHeader from "../components/UserHeader";
import SubalmacenCard from "../components/SubalmacenCard";

export default function SubalmacenesPorAlmacenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, loading: loadingUsuario } = useUsuario();
  const { subalmacenes, loading, error } = useSubalmacenesAsignadosByAlmacen(id);

  if (loadingUsuario || loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserHeader name={usuario?.nombre} role={usuario?.nombre_rol} />
      <main className="flex-1 flex flex-col items-center pt-8">
        {/* Botón de navegación al Dashboard */}
        <div className="w-full max-w-md mb-6">
          <button
            onClick={() => navigate('/dashboard-app')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
          >
            🏢 Almacenes
          </button>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-6 w-full max-w-md text-left">
          Subalmacenes
        </h2>
        {subalmacenes.length === 0 ? (
          <div className="text-gray-400 text-center w-full max-w-md py-8">
            No hay subalmacenes
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
            {subalmacenes.map((sub) => (
              <SubalmacenCard key={sub.id} nombre={sub.nombre} id={sub.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
