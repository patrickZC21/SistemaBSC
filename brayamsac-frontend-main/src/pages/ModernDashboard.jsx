import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { buildApiUrl } from '../config/api.js';
import useAutoLogout from "../hooks/useAutoLogout.js";
import { logEstadoSesion, verificarSesionActiva } from "../utils/sessionUtils.js";

import { 
  ModernDashboardCards, 
  ModernTrabajadoresSemana, 
  ModernHorasExtrasChart, 
  ModernMetricsPanel 
} from "@/components/charts";
import { MainLayout } from "@/components/layout";

export default function ModernDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);

  // Hook para gestión de sesión persistente (sin logout automático)
  useAutoLogout();

  // Estados para las cards
  const [almacenes, setAlmacenes] = useState(0);
  const [subalmacenes, setSubalmacenes] = useState(0);
  const [coordinadores, setCoordinadores] = useState(0);
  const [trabajadores, setTrabajadores] = useState(0);

  // Estado de carga para los datos del dashboard
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    const validarToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("Token no encontrado. Redirigiendo al login.");
        navigate("/");
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/api/auth/validar"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Token inválido");

        const data = await res.json();
        setUsuario(data.usuario);
      } catch (error) {
        console.error("Error al validar token:", error);
        localStorage.removeItem("token");
        navigate("/");
        return;
      } finally {
        setLoading(false);
      }
    };

    validarToken();
  }, [navigate]);

  useEffect(() => {
    if (!loading && usuario) {
      const fetchDashboardResumen = async () => {
        setLoadingCards(true);
        setError(null);
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(buildApiUrl("/api/dashboard/resumen"), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error("Error al obtener resumen del dashboard");
          
          const data = await res.json();
          setAlmacenes(data.total_almacenes);
          setSubalmacenes(data.total_subalmacenes);
          setCoordinadores(data.total_coordinadores);
          setTrabajadores(data.total_trabajadores);
        } catch (error) {
          console.error("Error al cargar resumen:", error);
          setError("Error al cargar los datos del dashboard");
        } finally {
          setLoadingCards(false);
        }
      };
      fetchDashboardResumen();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Validando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout usuario={usuario}>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Header del Dashboard */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Analítico</h1>
              <p className="text-gray-600 mt-1">
                Bienvenido de vuelta, {usuario?.nombre || "Usuario"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Cards principales */}
          {loadingCards ? (
            <div className="w-full flex items-center justify-center py-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="text-gray-500 text-sm">
                  {error ? error : "Cargando resumen..."}
                </span>
              </div>
            </div>
          ) : (
            <ModernDashboardCards
              almacenes={almacenes}
              subalmacenes={subalmacenes}
              coordinadores={coordinadores}
              trabajadores={trabajadores}
            />
          )}

          {/* Panel de métricas */}
          <ModernMetricsPanel />

          {/* Sección de gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernTrabajadoresSemana />
            <ModernHorasExtrasChart />
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
