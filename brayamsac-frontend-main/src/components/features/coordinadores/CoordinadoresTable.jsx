import { Eye, EyeOff, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";

const COLUMN_CONFIG = [
  { key: 'nombre', label: 'NOMBRE', type: 'text' },
  { key: 'correo', label: 'CORREO', type: 'text' },
  { key: 'password', label: 'PASSWORD', type: 'text' },
  { key: 'rol_nombre', label: 'ROL', type: 'text', getValue: c => c.rol_nombre || 'Coordinador' },
  { key: 'almacen', label: 'ALMACÉN', type: 'text', getValue: (c, fns) => fns.getAlmacenData(c.id).almacen },
  { key: 'subalmacen', label: 'SUBALMACÉN', type: 'text', getValue: (c, fns) => fns.getAlmacenData(c.id).subalmacen },
  { key: 'limite_ingresos', label: 'LÍMITES DE INGRESOS', type: 'number', getValue: (c, fns) => fns.getAlmacenData(c.id).limite_ingresos },
  { key: 'activo', label: 'ESTADO', type: 'bool' },
];

// Reordenar para que los últimos cuatro sean: ALMACÉN, SUBALMACÉN, LÍMITES DE INGRESOS, ESTADO
const COLUMN_CONFIG_ORDERED = [
  COLUMN_CONFIG[0], // NOMBRE
  COLUMN_CONFIG[1], // CORREO
  COLUMN_CONFIG[2], // PASSWORD
  COLUMN_CONFIG[3], // ROL
  COLUMN_CONFIG[4], // ALMACÉN
  COLUMN_CONFIG[5], // SUBALMACÉN
  COLUMN_CONFIG[6], // LÍMITES DE INGRESOS
  COLUMN_CONFIG[7], // ESTADO
];

const CoordinadoresTable = ({
  coordinadores,
  usuarioAlmacenes,
  onEdit,
  onDelete,
  onView,
}) => {
  // Estado para controlar visibilidad de contraseñas
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  // Solo coordinadores
  const soloCoordinadores = coordinadores
    ? coordinadores.filter((c) => c.rol_id === 3)
    : [];

  // Helper para obtener todos los datos de usuario_almacen por usuario
  const getAlmacenData = (usuario_id) => {
    const data = usuarioAlmacenes?.filter(
      (ua) => Number(ua.usuario_id) === Number(usuario_id)
    ) || [];
    // Obtener almacenes únicos
    const almacenesUnicos = [...new Set(data.map(d => d.almacen_nombre || "-"))];
    // Agrupar subalmacenes por almacén
    const subalmacenesPorAlmacen = almacenesUnicos.map(almacen => {
      const subs = data
        .filter(d => d.almacen_nombre === almacen)
        .map(d => d.subalmacen_nombre || "-");
      return subs; // ahora es un array
    });
    // Limite de ingresos: solo mostrar el primero
    const primerLimite = data.length > 0 ? data[0].limite_ingresos : "-";
    return {
      almacen: almacenesUnicos.join(", "),
      subalmacen: subalmacenesPorAlmacen, // array de arrays
      limite_ingresos: primerLimite,
    };
  };

  // Función para alternar visibilidad de contraseñas
  const togglePasswordVisibility = useCallback((userId) => {
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

  // Ordenamiento interactivo
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [originalCoordinadores, setOriginalCoordinadores] = useState(soloCoordinadores);
  React.useEffect(() => {
    setOriginalCoordinadores(soloCoordinadores);
  }, [coordinadores]);

  const handleSort = (key) => {
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
  };

  const fns = { getAlmacenData };

  const sortedCoordinadores = useMemo(() => {
    if (!sortBy) return originalCoordinadores;
    const col = COLUMN_CONFIG.find(c => c.key === sortBy);
    if (!col) return originalCoordinadores;
    const getValue = col.getValue || ((c, fns) => c[sortBy]);
    return [...originalCoordinadores].sort((a, b) => {
      let va = getValue(a, fns);
      let vb = getValue(b, fns);
      if (col.type === 'number') {
        va = va === undefined || va === null ? -Infinity : Number(va);
        vb = vb === undefined || vb === null ? -Infinity : Number(vb);
        return sortDir === 'asc' ? va - vb : vb - va;
      } else if (col.type === 'bool') {
        return sortDir === 'asc' ? (vb ? 1 : -1) - (va ? 1 : -1) : (va ? 1 : -1) - (vb ? 1 : -1);
      } else {
        va = va ? va.toString().toLowerCase() : '';
        vb = vb ? vb.toString().toLowerCase() : '';
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [originalCoordinadores, sortBy, sortDir, usuarioAlmacenes]);

  const getActiveIconColor = (colKey, dir) => {
    if (!sortBy) return '#cbd5e1';
    return sortBy === colKey && sortDir === dir ? '#60a5fa' : '#cbd5e1';
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-[#19202A] text-white text-xs">
            {COLUMN_CONFIG_ORDERED.map(col => (
              <th
                key={col.key}
                className={`py-3 px-3 text-left font-medium text-xs ${
                  col.key === 'nombre' ? 'rounded-tl-xl w-[130px]' : 
                  col.key === 'correo' ? 'w-[150px]' :
                  col.key === 'password' ? 'w-[120px]' :
                  col.key === 'rol_nombre' ? 'w-[100px]' :
                  col.key === 'almacen' ? 'w-[100px]' :
                  col.key === 'subalmacen' ? 'w-[120px]' :
                  col.key === 'limite_ingresos' ? 'w-[80px]' :
                  col.key === 'activo' ? 'w-[80px]' : ''
                }`}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold">{col.label}</span>
                  <div className="flex flex-col">
                    <ChevronUp size={10} style={{ color: getActiveIconColor(col.key, 'asc') }} />
                    <ChevronDown size={10} style={{ color: getActiveIconColor(col.key, 'desc'), marginTop: '-2px' }} />
                  </div>
                </div>
              </th>
            ))}
            <th className="py-3 px-3 text-left rounded-tr-xl w-[100px] font-medium text-xs">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold">ACCIONES</span>
                <div className="flex flex-col">
                  <ChevronUp size={10} style={{ color: '#cbd5e1' }} />
                  <ChevronDown size={10} style={{ color: '#cbd5e1', marginTop: '-2px' }} />
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCoordinadores.length > 0 ? (
            sortedCoordinadores.map((coordinador) => {
              const { almacen, subalmacen, limite_ingresos } = getAlmacenData(
                coordinador.id
              );
              return (
                <tr
                  key={coordinador.id}
                  className="border-b border-gray-200 bg-white hover:bg-gray-50 transition text-sm"
                >
                  <td className="py-3 px-3 font-medium w-[130px] truncate text-xs">{coordinador.nombre}</td>
                  <td className="py-3 px-3 w-[150px] truncate text-xs">{coordinador.correo}</td>
                  <td className="py-3 px-3 w-[120px] text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="font-mono text-xs">
                        {visiblePasswords.has(coordinador.id) 
                          ? (coordinador.password_info || (coordinador.id <= 6 ? '123456' : 'Ver admin'))
                          : '••••••••'
                        }
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(coordinador.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                        title={visiblePasswords.has(coordinador.id) ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {visiblePasswords.has(coordinador.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 w-[100px] truncate text-xs">
                    {coordinador.rol_nombre || "Coordinador"}
                  </td>
                  <td className="py-3 px-3 w-[100px] truncate text-xs">{almacen}</td>
                  <td className="py-3 px-3 w-[120px] text-xs">
                    <div className="text-xs">
                      {Array.isArray(subalmacen)
                        ? subalmacen.map((subs, idx) => (
                            <div key={idx} className="mb-1 last:mb-0">
                              {Array.isArray(subs)
                                ? subs.map((s, i) => (
                                    <div key={i} className="pl-1 border-l-2 border-blue-200 truncate text-xs">{s}</div>
                                  ))
                                : <div className="pl-1 border-l-2 border-blue-200 truncate text-xs">{subs}</div>}
                              {subalmacen.length > 1 && idx < subalmacen.length - 1 && (
                                <hr className="my-1 border-gray-200" />
                              )}
                            </div>
                          ))
                        : <div className="truncate text-xs">{subalmacen}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-3 w-[80px] text-center text-xs">{limite_ingresos}</td>
                  <td className="py-3 px-3 w-[80px] text-xs">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold inline-block
                      ${
                        coordinador.activo === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {coordinador.activo === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-3 w-[100px]">
                    <div className="flex gap-1 items-center justify-center">
                      <button
                        title={coordinador.activo === 1 ? "Desactivar" : "Activar"}
                        className={`p-1 rounded transition border border-transparent ${
                          coordinador.activo === 1
                            ? "text-green-600 hover:bg-green-100"
                            : "text-gray-400 hover:bg-red-100"
                        }`}
                        onClick={() => onView && onView(coordinador)}
                      >
                        <Eye size={16} fill={coordinador.activo === 1 ? "#22c55e" : "#d1d5db"} stroke={coordinador.activo === 1 ? "#22c55e" : "#d1d5db"} />
                      </button>
                      <button
                        title="Editar"
                        className="text-blue-600 hover:bg-blue-100 p-1 rounded transition"
                        onClick={() => onEdit(coordinador)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        title="Eliminar"
                        className="group p-1 rounded transition"
                        onClick={() => onDelete(coordinador.id)}
                      >
                        <Trash2
                          size={16}
                          className="text-gray-500 group-hover:text-red-600 transition-colors"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-6 text-gray-500 text-sm">
                No hay coordinadores registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CoordinadoresTable;