import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler,
} from 'chart.js';
import { buildApiUrl } from '../../config/api.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Nombres cortos de días en español
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const getDiaCorto = (fechaStr) => {
  const d = new Date(fechaStr + 'T12:00:00');
  return DIAS[d.getDay()];
};

export default function MetricsPanel() {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const fetchMetricas = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(buildApiUrl("/api/dashboard/metricas-tarjetas"), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        if (!ignore) setMetricas(result);
      } catch (err) {
        if (!ignore && err.name !== 'AbortError') {
          console.error('Error en métricas:', err);
          setError(err.message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchMetricas();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error || !metricas) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error en Métricas</h3>
            <p className="text-sm text-red-600 mb-4">{error || 'No se pudieron cargar las métricas'}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center text-gray-500"><p>Datos no disponibles</p></div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center text-gray-500"><p>Datos no disponibles</p></div>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos desde datos reales
  const asistenciaLabels = metricas.asistencia.semanal.map(d => getDiaCorto(d.fecha));
  const asistenciaValues = metricas.asistencia.semanal.map(d => d.tasa);

  const duracionLabels = metricas.duracion.semanal.map(d => getDiaCorto(d.fecha));
  const duracionValues = metricas.duracion.semanal.map(d => d.horas);

  const cumplimientoLabels = metricas.cumplimiento.semanal.map(d => getDiaCorto(d.fecha));
  const cumplimientoValues = metricas.cumplimiento.semanal.map(d => d.horas);

  const lineChartAsistencia = {
    labels: asistenciaLabels,
    datasets: [{
      label: 'Asistencia %',
      data: asistenciaValues,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const lineChartDuracion = {
    labels: duracionLabels,
    datasets: [{
      label: 'Horas',
      data: duracionValues,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const barChartCumplimiento = {
    labels: cumplimientoLabels,
    datasets: [{
      label: 'Horas trabajadas',
      data: cumplimientoValues,
      backgroundColor: '#F59E0B',
      borderRadius: 4,
    }]
  };

  const renderCambio = (valor) => {
    const esPositivo = valor >= 0;
    return (
      <div className={`text-sm font-medium flex items-center ${esPositivo ? 'text-green-600' : 'text-red-600'}`}>
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={esPositivo ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
        </svg>
        {esPositivo ? '+' : ''}{valor}%
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tasa de Asistencia */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Tasa de Asistencia</h3>
            <p className="text-sm text-gray-500">Asistencia del día</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <div className="text-xs text-blue-600 font-medium mb-1">Tasa</div>
            <div className="text-2xl font-bold text-blue-600">{metricas.asistencia.tasa}%</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-xs text-green-600 font-medium mb-1">Presentes</div>
            <div className="text-2xl font-bold text-green-600">{metricas.asistencia.presentes}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-xs text-gray-600 font-medium mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-600">{metricas.asistencia.total}</div>
          </div>
        </div>

        <div className="h-16">
          <Line data={lineChartAsistencia} options={chartOptions} />
        </div>
      </div>

      {/* Duración Promedio */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Duración Promedio</h3>
            <p className="text-sm text-gray-500">Horas por trabajador (7 días)</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {metricas.duracion.promedio}h
          </div>
          {renderCambio(metricas.duracion.cambio)}
        </div>

        <div className="h-16">
          <Line data={lineChartDuracion} options={chartOptions} />
        </div>
      </div>

      {/* Tasa de Cumplimiento */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Tasa de Cumplimiento</h3>
            <p className="text-sm text-gray-500">Horas trabajadas vs objetivo</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {metricas.cumplimiento.tasa}%
          </div>
          {renderCambio(metricas.cumplimiento.cambio)}
        </div>

        <div className="h-16">
          <Bar data={barChartCumplimiento} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
