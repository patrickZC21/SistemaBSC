import { Edit, Trash2, Calendar, Clock, User, Building, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { buildApiUrl } from '../config/security.js';

import MainLayout from "@/components/layout/MainLayout";
import { useUser } from "../hooks/useAuthUser";
import { eliminarAsistencia } from "../services/asistencia.service.js";

export default function Trabajador() {
  const { id } = useParams();
  const usuario = useUser();
  const [trabajador, setTrabajador] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Obtener datos del trabajador
    fetch(buildApiUrl(`/api/trabajadores/${id}`), { headers })
      .then((res) => res.json())
      .then((data) => {
        console.log("Trabajador:", data);
        setTrabajador(data);
      });

    // Obtener asistencias y resumen
    fetch(buildApiUrl(`/api/trabajadorAsistencia/${id}`), { headers })
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos recibidos:", data);
        setResumen(data.resumen || null);
        // Filtrar datos nulos antes de establecer el estado
        const asistenciasValidas = (data.asistencias || []).filter(asis => asis !== null && asis !== undefined);
        setAsistencias(asistenciasValidas);
      })
      .catch((error) => {
        console.error("Error al obtener asistencias:", error);
        setAsistencias([]);
        setResumen(null);
      });
  }, [id]);

  // Handlers para los botones
  const handleEdit = (asis) => {
    // Validación de seguridad para evitar errores con datos nulos
    if (!asis) return;
    
    setEditando({
      id: asis.id,
      hora_entrada: asis.hora_entrada || '',
      hora_salida: asis.hora_salida || '',
      justificacion: asis.justificacion || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editando || !editando.id) {
      alert('Error: No hay datos para guardar');
      return;
    }
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(buildApiUrl(`/api/asistencias/${editando.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hora_entrada: editando.hora_entrada || null,
          hora_salida: editando.hora_salida || null,
          justificacion: editando.justificacion || ''
        })
      });

      if (response.ok) {
        // Actualizar la lista de asistencias
        const updatedAsistencias = asistencias.map(asis => 
          asis && asis.id === editando.id 
            ? { ...asis, ...editando }
            : asis
        ).filter(asis => asis !== null && asis !== undefined);
        setAsistencias(updatedAsistencias);
        setEditando(null);
        alert('Asistencia actualizada correctamente');
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar la asistencia: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      alert('Error de conexión al actualizar la asistencia');
    }
  };

  const handleCancelEdit = () => {
    setEditando(null);
  };

  const onDelete = (asistenciaId) => {
    setConfirmDelete(asistenciaId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) {
      alert('Error: No hay asistencia seleccionada para eliminar');
      return;
    }
    
    const token = localStorage.getItem("token");
    try {
      const response = await eliminarAsistencia(confirmDelete, token);
      
      if (response.ok) {
        // Remover la asistencia de la lista
        const updatedAsistencias = asistencias.filter(asis => asis && asis.id !== confirmDelete);
        setAsistencias(updatedAsistencias);
        setConfirmDelete(null);
        alert('Asistencia eliminada correctamente');
        
        // Actualizar el resumen
        fetch(buildApiUrl(`/api/trabajadorAsistencia/${id}`), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        })
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setResumen(data.resumen || null);
            // Filtrar datos nulos antes de establecer el estado
            const asistenciasValidas = (data.asistencias || []).filter(asis => asis !== null && asis !== undefined);
            setAsistencias(asistenciasValidas);
          }
        })
        .catch((error) => {
          console.error('Error al actualizar resumen:', error);
        });
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar la asistencia: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al eliminar asistencia:', error);
      alert('Error de conexión al eliminar la asistencia');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  if (!trabajador) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Cargando...</div></div>;

  // Validación adicional para asegurar que asistencias sea un array válido
  const asistenciasSeguras = Array.isArray(asistencias) ? asistencias.filter(asis => asis !== null && asis !== undefined) : [];

  return (
    <MainLayout usuario={usuario}>
      <main className="flex-1 p-4 bg-gray-50">
        {/* Header mejorado con iconos */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Consulta de asistencias</h1>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Trabajador:</span>{" "}
            <span className="font-semibold text-gray-800">
              {trabajador ? trabajador.nombre : "Cargando..."}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="text-gray-500">DNI:</span>{" "}
            <span className="font-mono text-gray-700">
              {trabajador ? trabajador.dni : "Cargando..."}
            </span>
          </div>
        </div>
        
        {/* Tarjetas de resumen mejoradas con iconos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="w-3 h-3 text-gray-500" />
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Horas reales</div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {resumen ? resumen.horas_reales : "-"}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="w-3 h-3 text-blue-500" />
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Horas cumplidas</div>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {resumen ? resumen.horas_cumplidas : "-"}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="w-3 h-3 text-green-500" />
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Horas extras</div>
            </div>
            <div className="text-xl font-bold text-green-600">
              {resumen ? resumen.horas_extras : "-"}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="w-3 h-3 text-red-500" />
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Horas faltantes</div>
            </div>
            <div className="text-xl font-bold text-red-600">
              {resumen ? resumen.horas_faltantes : "-"}
            </div>
          </div>
        </div>

        {/* Tabla de asistencias mejorada con iconos y texto más pequeño */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Fecha</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>DNI</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Nombre</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>Sub-Almacén</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Almacén</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Hora de ingreso</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Hora de salida</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Edit className="w-3 h-3" />
                      <span>Obs</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left font-medium uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {asistenciasSeguras && asistenciasSeguras.length > 0 ? (
                  asistenciasSeguras
                    .filter((asis) => {
                      // Filtro más estricto para eliminar cualquier elemento null/undefined
                      if (!asis || typeof asis !== 'object') return false;
                      
                      return (
                        asis.hora_entrada ||
                        asis.hora_salida ||
                        (asis.justificacion && asis.justificacion.trim() !== "")
                      );
                    })
                    .map((asis, idx) => {
                      // Esta validación debería ser redundante ahora, pero la mantengo por seguridad
                      if (!asis || typeof asis !== 'object') {
                        console.warn('Elemento null encontrado en map:', asis);
                        return null;
                      }
                      
                      return (
                        <tr key={asis.id || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-2 py-2 text-gray-900 font-medium">
                            {asis.fecha
                              ? new Date(asis.fecha).toLocaleDateString("es-ES", { timeZone: "UTC" })
                              : "-"}
                          </td>
                          <td className="px-2 py-2 text-gray-600 font-mono">{asis.dni || "-"}</td>
                          <td className="px-2 py-2 text-gray-900 font-medium">{asis.trabajador || "-"}</td>
                          <td className="px-2 py-2 text-gray-600">{asis.subalmacen || "-"}</td>
                          <td className="px-2 py-2 text-gray-600">{asis.almacen || "-"}</td>
                          <td className="px-2 py-2 text-gray-900 font-mono">
                            {editando?.id === asis.id ? (
                              <input
                                type="time"
                                value={editando.hora_entrada || ''}
                                onChange={(e) => setEditando({...editando, hora_entrada: e.target.value})}
                                className="w-20 text-xs p-1 border rounded"
                              />
                            ) : (
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                asis && asis.hora_entrada && asis.hora_entrada !== '00:00:00' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {asis && asis.hora_entrada && asis.hora_entrada !== '00:00:00' ? asis.hora_entrada : "Sin registro"}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-gray-900 font-mono">
                            {editando?.id === asis.id ? (
                              <input
                                type="time"
                                value={editando.hora_salida || ''}
                                onChange={(e) => setEditando({...editando, hora_salida: e.target.value})}
                                className="w-20 text-xs p-1 border rounded"
                              />
                            ) : (
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                asis && asis.hora_salida && asis.hora_salida !== '00:00:00' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {asis && asis.hora_salida && asis.hora_salida !== '00:00:00' ? asis.hora_salida : "Sin registro"}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-gray-600">
                            {editando?.id === asis.id ? (
                              <input
                                type="text"
                                value={editando.justificacion || ''}
                                onChange={(e) => setEditando({...editando, justificacion: e.target.value})}
                                className="w-32 text-xs p-1 border rounded"
                                placeholder="Observaciones"
                              />
                            ) : (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {asis && asis.justificacion ? asis.justificacion : "Sin novedades"}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              {editando?.id === (asis && asis.id) ? (
                                <>
                                  <button
                                    className="inline-flex items-center p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Guardar"
                                    onClick={handleSaveEdit}
                                  >
                                    <span className="text-xs">✓</span>
                                  </button>
                                  <button
                                    className="inline-flex items-center p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Cancelar"
                                    onClick={handleCancelEdit}
                                  >
                                    <span className="text-xs">✕</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="inline-flex items-center p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Editar"
                                    onClick={() => handleEdit(asis)}
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    className="inline-flex items-center p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Eliminar"
                                    onClick={() => onDelete(asis && asis.id)}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }).filter(Boolean)
                ) : (
                  <tr>
                    <td className="px-2 py-6 text-gray-400 text-center" colSpan={9}>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-xs font-medium text-gray-500">No hay asistencias registradas</p>
                        <p className="text-xs text-gray-400 mt-1">Las asistencias aparecerán cuando se registren</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar eliminación
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar esta asistencia? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </MainLayout>
  );
}
