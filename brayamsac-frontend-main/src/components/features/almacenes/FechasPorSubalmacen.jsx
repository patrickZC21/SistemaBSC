import { Edit, Trash2, Check, X, Search } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from '../../../config/security.js';

import ConfirmModal from "../../ui/ConfirmModal";

import SeleccionarFechasModal from "./SeleccionarFechasModal";

const FechasPorSubalmacen = ({
  fechas,
  subalmacenId, // <-- Agregado aquí
  loading,
  editandoId,
  nuevaFecha,
  busqueda,
  setBusqueda,
  handleEditarClick,
  handleGuardarClick,
  handleCancelarClick,
  handleEliminarClick,
  showConfirm,
  confirmarEliminacion,
  cancelarEliminacion,
}) => {
  const [inputFecha, setInputFecha] = React.useState(nuevaFecha);
  const [mostrarModalFechas, setMostrarModalFechas] = useState(false);
  const [descargandoExcel, setDescargandoExcel] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setInputFecha(nuevaFecha);
  }, [nuevaFecha]);

  // Función para manejar la descarga de Excel
  const handleDescargarExcel = async (fechasSeleccionadas) => {
    console.log('📥 Función handleDescargarExcel llamada con:', fechasSeleccionadas); // Debug
    
    if (!fechasSeleccionadas || fechasSeleccionadas.length === 0) {
      console.error('No hay fechas seleccionadas para descargar');
      alert('Por favor, selecciona al menos una fecha para descargar.');
      return;
    }

    setDescargandoExcel(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Extraer IDs de las fechas - manejar diferentes estructuras de datos
      const idsString = fechasSeleccionadas.map(f => {
        // Si f es un objeto con idfecha o id
        if (typeof f === 'object' && f !== null) {
          return f.idfecha || f.id;
        }
        // Si f es directamente un ID
        return f;
      }).filter(id => id !== undefined && id !== null).join(',');
      
      console.log('📊 IDs a exportar:', idsString); // Debug
      
      if (!idsString) {
        throw new Error('No se pudieron obtener IDs válidos de las fechas seleccionadas');
      }
      
      const response = await fetch(buildApiUrl(`/api/exportar/fechas-excel?fechas=${idsString}&subalmacen=${subalmacenId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar Excel: ${response.status}`);
      }

      // Crear blob y descargar archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `fechas_subalmacen_${subalmacenId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`✅ Excel descargado con ${fechasSeleccionadas.length} fechas`);
      setMostrarModalFechas(false);
    } catch (error) {
      console.error('Error al descargar Excel:', error);
      alert('Error al descargar el archivo Excel. Por favor, inténtalo de nuevo.');
    } finally {
      setDescargandoExcel(false);
    }
  };

  // Función para abrir el modal de selección de fechas
  const handleAbrirModalExcel = () => {
    setMostrarModalFechas(true);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-ES", { timeZone: "UTC" });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Cargando...
      </div>
    );

  return (
    <div className="mt-4">
      {/* Buscador de fechas y botón excel */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Fechas del Subalmacén</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAbrirModalExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#0F7B0F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(15, 123, 15, 0.2)'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#0A5D0A';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(15, 123, 15, 0.3)';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = '#0F7B0F';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(15, 123, 15, 0.2)';
            }}
            title="Descargar fechas en Excel"
          >
            {/* Icono de Excel */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="white"/>
              <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8M16 17H8M10 9H8" stroke="#0F7B0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Excel
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar fecha"
              className="border-2 border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ minWidth: 220 }}
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr style={{ background: "#1a2233" }} className="rounded-t-xl">
              <th className="py-3 px-6 text-left text-white font-semibold">Fecha</th>
              <th className="py-3 px-6 text-center text-white font-semibold">Acciones</th>
            </tr>
          </thead>
        </table>
        <div className="max-h-[387px] overflow-y-auto">
          <table className="min-w-full">
            <tbody>
              {fechas.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => {
                    if (editandoId !== f.id) {
                      // Navega a la ruta correcta usando navigate
                      const soloFecha = f.fecha ? f.fecha.slice(0, 10) : "";
                      navigate(`/asistencias/${subalmacenId}/${soloFecha}`);
                    }
                  }}
                >
                  <td className="py-4 px-6 text-gray-700 text-base font-medium">
                    {editandoId === f.id ? (
                      <input
                        type="date"
                        value={inputFecha}
                        onChange={(e) => setInputFecha(e.target.value)}
                        className="border rounded px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => {}} // solo para evitar warning
                      />
                    ) : (
                      formatFecha(f.fecha)
                    )}
                  </td>
                  <td
                    className="py-4 px-6 text-center space-x-4 flex justify-center items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {editandoId === f.id ? (
                      <>
                        <button
                          className="inline-flex items-center px-2 py-1 text-green-600 hover:bg-green-50 rounded transition"
                          title="Guardar"
                          onClick={() => handleGuardarClick(f.id, inputFecha)}
                        >
                          <Check />
                        </button>
                        <button
                          className="inline-flex items-center px-2 py-1 text-gray-500 hover:bg-gray-100 rounded transition"
                          title="Cancelar"
                          onClick={handleCancelarClick}
                        >
                          <X />
                        </button>
                      </>
                    ) : (
                      <button
                        className="inline-flex items-center px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Editar"
                        onClick={() => handleEditarClick(f)}
                      >
                        <Edit />
                      </button>
                    )}
                    <button
                      className="inline-flex items-center px-2 py-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition"
                      title="Eliminar"
                      onClick={() => handleEliminarClick(f)}
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {fechas.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 px-6 text-center text-gray-400">
                    No hay fechas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Confirmación de eliminación */}
      {showConfirm && (
        <ConfirmModal
          show={showConfirm}
          onConfirm={confirmarEliminacion}
          onCancel={cancelarEliminacion}
          mensaje="¿Estás seguro que deseas eliminar esta fecha? Esta acción no se puede deshacer."
        />
      )}

      {/* Modal para seleccionar fechas para Excel */}
      <SeleccionarFechasModal
        open={mostrarModalFechas}
        onClose={() => setMostrarModalFechas(false)}
        fechas={fechas}
        onDescargar={handleDescargarExcel}
        loading={descargandoExcel}
      />
    </div>
  );
};

export default FechasPorSubalmacen;
