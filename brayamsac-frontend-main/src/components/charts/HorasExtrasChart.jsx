import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { buildApiUrl } from '../../config/api.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function HorasExtrasChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHorasExtras = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(buildApiUrl("/api/dashboard/horas-extras"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener ranking de horas extra");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHorasExtras();
  }, []);

  // Preparar datos para el gráfico
  const chartData = {
    labels: data.map(t => t.nombre),
    datasets: [
      {
        label: 'Horas Extra',
        data: data.map(t => parseFloat(t.horas_extra) || 0),
        backgroundColor: [
          '#3B82F6', // Azul
          '#10B981', // Verde esmeralda
          '#F59E0B', // Amarillo
          '#EF4444', // Rojo
          '#8B5CF6', // Violeta
          '#EC4899', // Rosa
          '#06B6D4', // Cian
          '#84CC16', // Lima
        ],
        borderWidth: 0,
        cutout: '75%',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const trabajador = data[context.dataIndex];
            return `${trabajador.nombre}: ${trabajador.horas_extra}hrs`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        displayColors: true,
      }
    },
  };

  const totalHoras = data.reduce((sum, t) => sum + (parseFloat(t.horas_extra) || 0), 0);

  // Colores para las categorías
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Distribución de Horas</h3>
          <p className="text-sm text-gray-500 mt-1">Horas extra por trabajador</p>
        </div>
        <div className="flex space-x-2">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{totalHoras.toFixed(1)}hrs</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No hay trabajadores con horas extra</p>
          <p className="text-gray-400 text-xs mt-1">Aparecerán aquí cuando superen sus horas objetivo</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gráfico de dona */}
          <div className="relative h-64">
            <Doughnut data={chartData} options={options} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{totalHoras.toFixed(0)}</p>
                <p className="text-sm text-gray-500">Horas Extra</p>
              </div>
            </div>
          </div>

          {/* Leyenda personalizada */}
          <div className="space-y-3">
            {data.slice(0, 6).map((trabajador, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[idx] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {trabajador.nombre}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {trabajador.horas_extra}hrs
                  </span>
                  <p className="text-xs text-gray-500">
                    {((parseFloat(trabajador.horas_extra) / totalHoras) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{data.length}</p>
              <p className="text-xs text-gray-500">Trabajadores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {data.length > 0 ? (totalHoras / data.length).toFixed(1) : 0}
              </p>
              <p className="text-xs text-gray-500">Promedio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {data.length > 0 ? Math.max(...data.map(t => parseFloat(t.horas_extra))) : 0}
              </p>
              <p className="text-xs text-gray-500">Máximo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
