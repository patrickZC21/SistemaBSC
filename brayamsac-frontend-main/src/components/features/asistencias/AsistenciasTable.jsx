import { ChevronUp, ChevronDown, Search, Check, X } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import AsistenciasActions from "./AsistenciasActions";
import { asistenciaService } from "@/services/asistenciaService.js";


const COLUMN_CONFIG = [
  { key: 'almacen_nombre', label: 'Almacén', type: 'text' },
  { key: 'subalmacen_nombre', label: 'Subalmacén', type: 'text' },
  { key: 'trabajador_nombre', label: 'Nombre', type: 'text' },
  { key: 'trabajador_dni', label: 'DNI', type: 'text' },
  { key: 'hora_entrada', label: 'Hora Entrada', type: 'text' },
  { key: 'hora_salida', label: 'Hora Salida', type: 'text' },
  { key: 'justificacion', label: 'Justificación', type: 'text' },
  { key: 'registrado_por_nombre', label: 'Registrado por', type: 'text' },
];

export default function AsistenciasTable({ asistencias, onEditar, onEliminar, onActualizarLista }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [originalAsistencias, setOriginalAsistencias] = useState(asistencias);
  const [searchNombre, setSearchNombre] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Estados para edición inline
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    hora_entrada: '',
    hora_salida: '',
    justificacion: ''
  });
  const [saving, setSaving] = useState(false);

  // Debounce para el buscador
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchNombre);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchNombre]);
  React.useEffect(() => {
    setOriginalAsistencias(asistencias);
  }, [asistencias]);

  const handleStartEdit = useCallback((asistencia) => {
    setEditingId(asistencia.id);
    setEditData({
      hora_entrada: asistencia.hora_entrada || '',
      hora_salida: asistencia.hora_salida || '',
      justificacion: asistencia.justificacion || ''
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditData({
      hora_entrada: '',
      hora_salida: '',
      justificacion: ''
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;

    setSaving(true);
    try {
      const datosActualizacion = {
        hora_entrada: editData.hora_entrada || null,
        hora_salida: editData.hora_salida || null,
        justificacion: editData.justificacion || ''
      };

      await asistenciaService.actualizarAsistencia(editingId, datosActualizacion);

      // Limpiar estado de edición
      setEditingId(null);
      setEditData({
        hora_entrada: '',
        hora_salida: '',
        justificacion: ''
      });

      // Refrescar la lista desde el servidor
      if (onActualizarLista) {
        await onActualizarLista();
      }

      alert('✅ Asistencia actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      alert(`❌ Error al actualizar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [editingId, editData, onActualizarLista]);

  const handleInputChange = useCallback((field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSort = useCallback((key) => {
    if (sortBy === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else if (sortDir === 'desc') {
        setSortBy(null);
        setSortDir('asc');
      }
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  }, [sortBy, sortDir]);

  const filteredAsistencias = useMemo(() => {
    if (!debouncedSearch) return originalAsistencias;
    return originalAsistencias.filter(a =>
      a.trabajador_nombre && a.trabajador_nombre.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [originalAsistencias, debouncedSearch]);

  const sortedAsistencias = useMemo(() => {
    if (!sortBy) return filteredAsistencias;
    const col = COLUMN_CONFIG.find(c => c.key === sortBy);
    if (!col) return filteredAsistencias;
    return [...filteredAsistencias].sort((a, b) => {
      let va = a[sortBy];
      let vb = b[sortBy];
      va = va ? va.toString().toLowerCase() : '';
      vb = vb ? vb.toString().toLowerCase() : '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAsistencias, sortBy, sortDir]);

  const getActiveIconColor = (colKey, dir) => {
    if (!sortBy) return '#cbd5e1';
    return sortBy === colKey && sortDir === dir ? '#60a5fa' : '#cbd5e1';
  };

  return (
    <>
      {/* Fila superior: botón y buscador - separado de la tabla */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {/* ...aquí va el botón, si existe, por ejemplo: <BotonAgregarTrabajador /> ... */}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="border-2 border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              placeholder="Buscar nombre"
              value={searchNombre}
              onChange={e => setSearchNombre(e.target.value)}
              style={{ minWidth: 220 }}
            />
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-auto rounded-xl shadow bg-white">
        <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-slate-800 text-white text-xs">
            {COLUMN_CONFIG.map(col => (
              <th
                key={col.key}
                className="px-2 sm:px-4 py-2 text-center whitespace-nowrap"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort(col.key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {col.label}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <ChevronUp size={12} style={{ color: getActiveIconColor(col.key, 'asc') }} />
                    <ChevronDown size={12} style={{ color: getActiveIconColor(col.key, 'desc'), marginTop: '-2px' }} />
                  </div>
                </div>
              </th>
            ))}
            <th className="px-2 sm:px-4 py-2 text-center whitespace-nowrap">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                Acciones
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <ChevronUp size={12} style={{ color: '#cbd5e1' }} />
                  <ChevronDown size={12} style={{ color: '#cbd5e1', marginTop: '-2px' }} />
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAsistencias.map((asis) => (
            <tr
              key={asis.id}
              className={`hover:bg-slate-50 ${editingId === asis.id ? 'bg-blue-50' : 'cursor-pointer'}`}
              onClick={(e) => {
                // Solo navegar si no estamos editando y no se hizo clic en una celda editable
                if (editingId !== asis.id && !e.target.closest('.editable-cell')) {
                  navigate(`/trabajador/${asis.trabajador_id}`);
                }
              }}
            >
              <td className="px-2 sm:px-4 py-2 text-center">{asis.almacen_nombre || <span className="text-gray-400">-</span>}</td>
              <td className="px-2 sm:px-4 py-2 text-center">{asis.subalmacen_nombre || <span className="text-gray-400">-</span>}</td>
              <td className="px-2 sm:px-4 py-2 text-center">{asis.trabajador_nombre || <span className="text-gray-400">-</span>}</td>
              <td className="px-2 sm:px-4 py-2 text-center">{asis.trabajador_dni || <span className="text-gray-400">-</span>}</td>
              
              {/* Hora Entrada - Editable */}
              <td 
                className="px-2 sm:px-4 py-2 text-center editable-cell"
                onClick={(e) => e.stopPropagation()}
              >
                {editingId === asis.id ? (
                  <input
                    type="time"
                    value={editData.hora_entrada}
                    onChange={(e) => handleInputChange('hora_entrada', e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span 
                    className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded"
                    onClick={() => handleStartEdit(asis)}
                  >
                    {asis.hora_entrada || "-"}
                  </span>
                )}
              </td>
              
              {/* Hora Salida - Editable */}
              <td 
                className="px-2 sm:px-4 py-2 text-center editable-cell"
                onClick={(e) => e.stopPropagation()}
              >
                {editingId === asis.id ? (
                  <input
                    type="time"
                    value={editData.hora_salida}
                    onChange={(e) => handleInputChange('hora_salida', e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span 
                    className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded"
                    onClick={() => handleStartEdit(asis)}
                  >
                    {asis.hora_salida || "-"}
                  </span>
                )}
              </td>
              
              {/* Justificación - Editable */}
              <td 
                className="px-2 sm:px-4 py-2 text-center editable-cell"
                onClick={(e) => e.stopPropagation()}
              >
                {editingId === asis.id ? (
                  <input
                    type="text"
                    value={editData.justificacion}
                    onChange={(e) => handleInputChange('justificacion', e.target.value)}
                    className="w-32 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Justificación"
                  />
                ) : (
                  <span 
                    className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded"
                    onClick={() => handleStartEdit(asis)}
                  >
                    {asis.justificacion || "-"}
                  </span>
                )}
              </td>
              
              <td className="px-2 sm:px-4 py-2 text-center">{asis.registrado_por_nombre || "-"}</td>
              <td
                className="px-2 sm:px-4 py-2 text-center"
                onClick={e => e.stopPropagation()}
              >
                {editingId === asis.id ? (
                  <div className="flex items-center justify-center gap-1">
                    <button
                      className="inline-flex items-center p-1 text-green-600 hover:bg-green-50 rounded transition"
                      title="Guardar"
                      onClick={handleSaveEdit}
                      disabled={saving}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="inline-flex items-center p-1 text-red-600 hover:bg-red-50 rounded transition"
                      title="Cancelar"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <AsistenciasActions
                    asistencia={asis}
                    onEditar={handleStartEdit}
                    onEliminar={onEliminar}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}