import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl, tokenManager, logger, apiRequest } from "../config/app-security.js";
import UserHeader from "../components/UserHeader";
import { useUsuario } from "../hooks/useUsuario";
import { useAutoLogoutOnClose, useSessionRestore } from "../hooks/useAutoLogout";

export default function DashboardApp() {
  const navigate = useNavigate();
  const { usuario, loading } = useUsuario();
  const [almacenes, setAlmacenes] = useState([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(true);
  const [error, setError] = useState(null);
  
  // Hook para logout automático solo en cierre real de la aplicación
  useAutoLogoutOnClose();
  
  // Hook para restaurar sesión automáticamente al abrir la app
  useSessionRestore();

  useEffect(() => {
    // Marcar la sesión como persistente y actualizar actividad
    tokenManager.markSessionPersistent();
    localStorage.setItem('lastActivity', Date.now().toString());
    localStorage.setItem('sessionActive', 'true');
    logger.log('📱 Dashboard cargado - sesión persistente configurada');
    
    const loadAlmacenes = async () => {
      try {
        setLoadingAlmacenes(true);
        const url = buildApiUrl("/api/almacenes");
        const data = await apiRequest(url);
        
        if (Array.isArray(data)) {
          setAlmacenes(data);
        } else {
          logger.warn('Datos de almacenes no válidos:', data);
          setAlmacenes([]);
        }
      } catch (error) {
        logger.error('Error al cargar almacenes:', error);
        setError("Error al cargar almacenes");
        setAlmacenes([]);
      } finally {
        setLoadingAlmacenes(false);
      }
    };

    loadAlmacenes();
  }, []);

  if (loading || loadingAlmacenes)
    return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserHeader name={usuario?.nombre} role={usuario?.nombre_rol} />
      <main className="flex-1 flex flex-col items-center pt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-6 w-full max-w-md text-left">
          Almacen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
          {almacenes.map((almacen) => (
            <div
              key={almacen.id}
              className="bg-white rounded-lg shadow flex flex-col items-center justify-center p-8 cursor-pointer hover:shadow-lg transition border border-gray-100"
              onClick={() => navigate(`/subalmacenes/${almacen.id}`)}
            >
              <div className="text-4xl">🏢</div>
              <span className="font-bold text-gray-500 text-base tracking-wide text-center">
                {almacen.nombre}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
