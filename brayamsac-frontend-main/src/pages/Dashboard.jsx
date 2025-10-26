import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { buildApiUrl } from '../config/api.js';
import useAutoLogout from "../hooks/useAutoLogout.js";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime.js";

import DashboardCards from "@/components/charts/DashboardCards.jsx";
import TrabajadoresSemanaStats from "@/components/charts/TrabajadoresSemanaStats.jsx";
import HorasExtrasChart from "@/components/charts/HorasExtrasChart.jsx";
import MetricsPanel from "@/components/charts/MetricsPanel.jsx";
import MainLayout from "@/components/layout/MainLayout.jsx";

export default function Dashboard() {
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

  // Key para forzar re-render en componentes hijos
  const [refreshKey, setRefreshKey] = useState(0);

  // Función para cargar datos del resumen del dashboard
  const fetchDashboardResumen = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
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
      setError(null);
    } catch (error) {
      console.error("Error al cargar resumen:", error);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoadingCards(false);
    }
  }, []);

  // 📊 Hook de tiempo real - recarga datos cuando hay cambios en el backend
  const { isConnected, lastUpdate, refreshCount } = useDashboardRealtime(
    useCallback((event) => {
      console.log('📊 Dashboard: Actualización en tiempo real recibida', event);
      // Recargar datos del resumen
      fetchDashboardResumen();
      // Forzar re-render de componentes hijos (gráficos)
      setRefreshKey(prev => prev + 1);
    }, [fetchDashboardResumen]),
    60000 // Auto-refresh cada 60 segundos
  );

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
      fetchDashboardResumen();
    }
  }, [loading, usuario, fetchDashboardResumen]);

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
        <div className="p-6 space-y-6">
          {/* 🔴 Indicador de tiempo real */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                <span className={`relative flex h-2.5 w-2.5`}>
                  {isConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isConnected ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                </span>
                <span>{isConnected ? 'En vivo' : 'Reconectando...'}</span>
              </div>
              {lastUpdate && (
                <span className="text-xs text-gray-400">
                  Última actualización: {new Date(lastUpdate).toLocaleTimeString('es-ES')}
                </span>
              )}
            </div>
            <button 
              onClick={() => {
                fetchDashboardResumen();
                setRefreshKey(prev => prev + 1);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
              title="Actualizar datos manualmente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualizar</span>
            </button>
          </div>

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
            <DashboardCards
              almacenes={almacenes}
              subalmacenes={subalmacenes}
              coordinadores={coordinadores}
              trabajadores={trabajadores}
            />
          )}

          {/* Panel de métricas */}
          <MetricsPanel key={`metrics-${refreshKey}`} />

          {/* Sección de gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrabajadoresSemanaStats key={`trabajadores-${refreshKey}`} />
            <HorasExtrasChart key={`horas-${refreshKey}`} />
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
