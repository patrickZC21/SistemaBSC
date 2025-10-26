import { useEffect, useState } from "react";
import { buildApiUrl } from '../../config/security.js';

export default function ModernTrabajadoresSemana() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrabajadoresSemana = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(buildApiUrl("/api/dashboard/trabajadores-semana"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error al obtener trabajadores de la semana");
        const data = await res.json();
        setTrabajadores(data);
      } catch (error) {
        console.error(error);
        setTrabajadores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrabajadoresSemana();
  }, []);

  const getStatusColor = (activo) => {
    return activo 
      ? "bg-green-100 text-green-700 border border-green-200" 
      : "bg-red-100 text-red-700 border border-red-200";
  };

  const getInitialColor = (activo) => {
    return activo 
      ? "bg-green-500 text-white" 
      : "bg-gray-400 text-white";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Actividad Reciente</h3>
          <p className="text-sm text-gray-500 mt-1">Trabajadores activos esta semana</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : trabajadores.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No hay asistencias registradas esta semana</p>
          <p className="text-gray-400 text-xs mt-1">Los trabajadores aparecerán cuando registren asistencias</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trabajadores.slice(0, 6).map((trabajador, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getInitialColor(trabajador.activo)}`}>
                  {trabajador.nombre ? trabajador.nombre.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {trabajador.nombre || "Sin nombre"}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{trabajador.almacen}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-xs text-gray-500">{trabajador.subalmacen}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trabajador.activo)}`}>
                  {trabajador.activo ? "Activo" : "Inactivo"}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
          
          {trabajadores.length > 6 && (
            <div className="mt-6 text-center">
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto">
                <span>Ver más trabajadores</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
