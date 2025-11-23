import React from "react";
import { useSubalmacenes } from "../hooks/useSubalmacenes";
import UserHeader from "../components/UserHeader";
import { useUsuario } from "../hooks/useUsuario";
import SubalmacenCard from "../components/SubalmacenCard";

export default function SubalmacenesPage() {
  const { usuario, loading: loadingUsuario } = useUsuario();
  const { subalmacenes, loading, error } = useSubalmacenes();

  if (loadingUsuario || loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserHeader name={usuario?.nombre} role={usuario?.nombre_rol} />
      <main className="flex-1 flex flex-col items-center pt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-6 w-full max-w-md text-left">
          Subalmacenes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
          {subalmacenes.map((sub) => (
            <SubalmacenCard key={sub.id} nombre={sub.nombre} />
          ))}
        </div>
      </main>
    </div>
  );
}
