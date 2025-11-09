import { Edit3, Trash2, UserCheck, UserX, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';

import { logger } from '../../../config/security.js';

export default function RRHHTable({ rrhh, onEdit, onDelete, onView }) {
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  // Configuración de columnas ordenables
  const COLUMN_CONFIG = [
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'correo', label: 'CORREO' },
    { key: 'password', label: 'CONTRASEÑA' },
    { key: 'rol', label: 'ROL' },
    { key: 'estado', label: 'ESTADO' }
  ];

  const handleSort = useCallback((key) => {
    logger.log(`[RRHHTable] Ordenando por: ${key}`);
    
    if (sortBy === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
        logger.log(`[RRHHTable] Cambio a orden descendente: ${key}`);
      } else if (sortDir === 'desc') {
        setSortBy(null);
        setSortDir('asc');
        logger.log(`[RRHHTable] Removiendo ordenamiento`);
      }
    } else {
      setSortBy(key);
      setSortDir('asc');
      logger.log(`[RRHHTable] Nuevo ordenamiento ascendente: ${key}`);
    }
  }, [sortBy, sortDir]);

  const sortedRRHH = useMemo(() => {
    const startTime = performance.now();
    
    if (!sortBy) {
      logger.log(`[RRHHTable] Sin ordenamiento, ${rrhh.length} registros`);
      return rrhh;
    }
    
    const sorted = [...rrhh].sort((a, b) => {
      let va, vb;
      
      switch (sortBy) {
        case 'nombre':
          va = a.nombre?.toLowerCase() || '';
          vb = b.nombre?.toLowerCase() || '';
          break;
        case 'correo':
          va = a.correo?.toLowerCase() || '';
          vb = b.correo?.toLowerCase() || '';
          break;
        case 'password':
          va = '••••••••'; // Las contraseñas no se ordenan por seguridad
          vb = '••••••••';
          break;
        case 'rol':
          va = 'RRHH';
          vb = 'RRHH';
          break;
        case 'estado':
          va = a.activo === 1 ? 'Activo' : 'Inactivo';
          vb = b.activo === 1 ? 'Activo' : 'Inactivo';
          break;
        default:
          return 0;
      }
      
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    
    const endTime = performance.now();
    logger.log(`[RRHHTable] Ordenamiento completado en ${(endTime - startTime).toFixed(2)}ms - ${sorted.length} registros`);
    
    return sorted;
  }, [rrhh, sortBy, sortDir]);

  const getActiveIconColor = useCallback((colKey, dir) => {
    if (!sortBy) return '#cbd5e1';
    return sortBy === colKey && sortDir === dir ? '#60a5fa' : '#cbd5e1';
  }, [sortBy, sortDir]);

  // Handlers optimizados con useCallback para evitar re-renders innecesarios
  const handleEdit = useCallback((persona) => {
    logger.log(`[RRHHTable] Editando usuario ID: ${persona.id}`);
    onEdit(persona);
  }, [onEdit]);

  const handleDelete = useCallback((id) => {
    logger.log(`[RRHHTable] Eliminando usuario ID: ${id}`);
    onDelete(id);
  }, [onDelete]);

  const handleView = useCallback((persona) => {
    logger.log(`[RRHHTable] Cambiando estado usuario ID: ${persona.id}, estado actual: ${persona.activo ? 'Activo' : 'Inactivo'}`);
    onView(persona);
  }, [onView]);

  const togglePasswordVisibility = useCallback((userId) => {
    logger.log(`[RRHHTable] Alternando visibilidad de contraseña para usuario ID: ${userId}`);
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  // Log de render para debugging
  React.useEffect(() => {
    logger.log(`[RRHHTable] Render - ${sortedRRHH.length} registros, ordenamiento: ${sortBy || 'ninguno'} ${sortDir}`);
  }, [sortedRRHH.length, sortBy, sortDir]);

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full table-fixed divide-y divide-gray-200 rounded-lg">
        <thead>
          <tr>
            {COLUMN_CONFIG.map((col, index) => (
              <th
                key={col.key}
                className={`py-2 text-xs font-semibold text-white uppercase bg-[#1a202c] border-b border-gray-200 ${
                  index === 0 ? 'w-[18%] px-6 text-left' : // NOMBRE - 18%
                  index === 1 ? 'w-[25%] px-4 text-left' : // CORREO - 25%
                  index === 2 ? 'w-[15%] px-4 text-center' : // CONTRASEÑA - 15%
                  index === 3 ? 'w-[12%] px-4 text-center' : // ROL - 12%
                  'w-[12%] px-4 text-center' // ESTADO - 12%
                }`}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}>
                  <ChevronUp size={14} style={{ display: 'block', color: getActiveIconColor(col.key, 'asc') }} />
                  <ChevronDown size={14} style={{ display: 'block', marginTop: -2, color: getActiveIconColor(col.key, 'desc') }} />
                </span>
              </th>
            ))}
            <th className="w-[18%] px-4 py-2 text-center text-xs font-semibold text-white uppercase bg-[#1a202c] border-b border-gray-200">
              ACCIONES
              <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}>
                <ChevronUp size={14} style={{ display: 'block', color: '#cbd5e1' }} />
                <ChevronDown size={14} style={{ display: 'block', marginTop: -2, color: '#cbd5e1' }} />
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedRRHH.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                No hay usuarios de RRHH registrados
              </td>
            </tr>
          ) : (
            sortedRRHH.map((persona) => (
              <tr key={persona.id} className="hover:bg-gray-50 transition-colors">
                <td className="w-[18%] px-6 py-3 whitespace-nowrap text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {persona.nombre}
                  </div>
                </td>
                <td className="w-[25%] px-4 py-3 whitespace-nowrap text-left">
                  <div className="text-sm text-gray-700">
                    {persona.correo}
                  </div>
                </td>
                <td className="w-[15%] px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-gray-500 font-mono">
                      {visiblePasswords.has(persona.id) ? persona.password_info || '••••••••' : '••••••••'}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(persona.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                      title={visiblePasswords.has(persona.id) ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {visiblePasswords.has(persona.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </td>
                <td className="w-[12%] px-4 py-3 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    RRHH
                  </span>
                </td>
                <td className="w-[12%] px-4 py-3 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    persona.activo === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {persona.activo === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="w-[18%] px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleView(persona)}
                      className={`p-2 rounded-lg transition-colors ${
                        persona.activo === 1
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={persona.activo === 1 ? 'Desactivar' : 'Activar'}
                    >
                      {persona.activo === 1 ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(persona)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(persona.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
