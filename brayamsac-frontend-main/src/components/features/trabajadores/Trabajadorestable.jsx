
import { ChevronDown, ChevronUp, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import React, { useState, useMemo } from 'react';


const COLUMN_CONFIG = [
  { key: 'nombre', label: 'Nombre', type: 'text' },
  { key: 'dni', label: 'DNI', type: 'text' },
  { key: 'almacen', label: 'Almacén', type: 'text', getValue: (t, fns) => fns.getAlmacenNombre(t.almacen) || '—' },
  { key: 'subalmacen', label: 'Subalmacén', type: 'text', getValue: (t, fns) => fns.getSubalmacenNombre(t.subalmacen) || '—' },
  { key: 'coordinador', label: 'Coordinador', type: 'text', getValue: (t, fns) => fns.getCoordinadorNombre(t.coordinador) || '—' },
  { key: 'activo', label: 'Estado', type: 'bool' },
  { key: 'horas_objetivo', label: 'Horas Objetivo', type: 'number' },
];

const TrabajadoresTable = ({
  trabajadores,
  getAlmacenNombre,
  getSubalmacenNombre,
  getCoordinadorNombre,
  onEdit,
  onToggleActivo,
  onEliminar,
  navigate
}) => {
  const [sortBy, setSortBy] = useState(null); // null = sin orden
  const [sortDir, setSortDir] = useState('asc');
  const [originalTrabajadores, setOriginalTrabajadores] = useState(trabajadores);

  // Mantener copia original si cambia la prop trabajadores
  React.useEffect(() => {
    setOriginalTrabajadores(trabajadores);
  }, [trabajadores]);

  const fns = { getAlmacenNombre, getSubalmacenNombre, getCoordinadorNombre };

  const handleSort = (key) => {
    if (sortBy === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else if (sortDir === 'desc') {
        setSortBy(null); // Quitar orden
        setSortDir('asc');
      }
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const sortedTrabajadores = useMemo(() => {
    if (!sortBy) return originalTrabajadores;
    const col = COLUMN_CONFIG.find(c => c.key === sortBy);
    if (!col) return originalTrabajadores;
    const getValue = col.getValue || ((t) => t[sortBy]);
    return [...originalTrabajadores].sort((a, b) => {
      let va = getValue(a, fns);
      let vb = getValue(b, fns);
      if (col.type === 'number') {
        va = va === undefined || va === null ? -Infinity : Number(va);
        vb = vb === undefined || vb === null ? -Infinity : Number(vb);
        return sortDir === 'asc' ? va - vb : vb - va;
      } else if (col.type === 'bool') {
        // Activo primero si ascendente
        return sortDir === 'asc' ? (vb ? 1 : -1) - (va ? 1 : -1) : (va ? 1 : -1) - (vb ? 1 : -1);
      } else {
        va = va ? va.toString().toLowerCase() : '';
        vb = vb ? vb.toString().toLowerCase() : '';
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [originalTrabajadores, sortBy, sortDir, getAlmacenNombre, getSubalmacenNombre, getCoordinadorNombre]);

  const getActiveIconColor = (colKey, dir) => {
    if (!sortBy) return '#cbd5e1';
    return sortBy === colKey && sortDir === dir ? '#60a5fa' : '#cbd5e1';
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg shadow-sm border border-gray-200">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
            {COLUMN_CONFIG.map(col => (
              <th
                key={col.key}
                className="px-3 py-2 text-left text-xs font-medium text-slate-100 uppercase tracking-wider cursor-pointer hover:bg-slate-600 transition-colors"
                onClick={() => handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  <span>{col.label}</span>
                  <div className="flex flex-col">
                    <ChevronUp size={12} style={{ color: getActiveIconColor(col.key, 'asc') }} />
                    <ChevronDown size={12} style={{ color: getActiveIconColor(col.key, 'desc'), marginTop: -2 }} />
                  </div>
                </div>
              </th>
            ))}
            <th className="px-3 py-2 text-center text-xs font-medium text-slate-100 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedTrabajadores.map((trabajador, index) => (
            <tr
              key={trabajador.id}
              className={`cursor-pointer transition-colors ${
                index % 2 === 0 
                  ? 'bg-white hover:bg-blue-50' 
                  : 'bg-gray-50 hover:bg-blue-50'
              }`}
              onClick={() => navigate(`/trabajador/${trabajador.id}`)}
            >
              <td className="px-3 py-2 text-xs text-gray-800 font-medium">{trabajador.nombre}</td>
              <td className="px-3 py-2 text-xs text-gray-600 font-mono">{trabajador.dni}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{getAlmacenNombre(trabajador.almacen) || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{getSubalmacenNombre(trabajador.subalmacen) || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{getCoordinadorNombre(trabajador.coordinador) || "—"}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  trabajador.activo 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {trabajador.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-3 py-2 text-xs text-gray-600 font-mono">
                {trabajador.horas_objetivo !== undefined && trabajador.horas_objetivo !== null
                  ? Number(trabajador.horas_objetivo).toFixed(2)
                  : "—"}
              </td>
              <td className="px-3 py-2 text-center"
                  onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1">
                  {/* Activar/Desactivar */}
                  <button
                    title={trabajador.activo ? "Desactivar" : "Activar"}
                    onClick={() => onToggleActivo(trabajador.id, trabajador.activo)}
                    className={`p-1 rounded-md transition-colors ${
                      trabajador.activo 
                        ? "text-emerald-600 hover:bg-emerald-100" 
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {trabajador.activo
                      ? <ToggleRight size={16} />
                      : <ToggleLeft size={16} />
                    }
                  </button>
                  {/* Editar */}
                  <button
                    title="Editar"
                    onClick={() => onEdit(trabajador)}
                    className="p-1 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  {/* Eliminar */}
                  <button
                    title="Eliminar"
                    onClick={() => onEliminar(trabajador.id)}
                    className="p-1 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrabajadoresTable;

