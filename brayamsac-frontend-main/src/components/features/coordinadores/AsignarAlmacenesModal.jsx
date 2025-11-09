import React, { useState, useEffect } from 'react';

const AsignarAlmacenesModal = ({
  showModal,
  setShowModal,
  usuarioId,
  coordinadorNombre,
  almacenesDisponibles = [],
  subalmacenesDisponibles = [],
  onAsignar,
  loading
}) => {
  console.log('DEBUG AsignarAlmacenesModal - Props recibidas:', {
    showModal, usuarioId, coordinadorNombre, almacenesDisponibles: almacenesDisponibles.length, 
    subalmacenesDisponibles: subalmacenesDisponibles.length
  });
  
  const [almacenId, setAlmacenId] = useState("");
  const [subalmacenIds, setSubalmacenIds] = useState([]);
  const [limiteIngresos, setLimiteIngresos] = useState(1);

  useEffect(() => {
    if (!showModal) {
      setAlmacenId("");
      setSubalmacenIds([]);
      setLimiteIngresos(1);
    }
  }, [showModal]);

  const subalmacenesFiltrados = subalmacenesDisponibles.filter(
    sa => String(sa.almacen_id) === String(almacenId)
  );

  const handleAsignar = async (e) => {
    e.preventDefault();
    console.log('DEBUG AsignarAlmacenesModal - usuarioId:', usuarioId);
    console.log('DEBUG AsignarAlmacenesModal - almacenId:', almacenId);
    console.log('DEBUG AsignarAlmacenesModal - subalmacenIds:', subalmacenIds);
    
    if (!almacenId || subalmacenIds.length === 0) {
      alert("Selecciona almacén y al menos un subalmacén");
      return;
    }
    
    // Validación extra: asegurar que todos los subalmacen_id sean numéricos y válidos
    const subalmacenesValidos = subalmacenIds.filter(id => !isNaN(Number(id)) && Number(id) > 0);
    if (subalmacenesValidos.length === 0) {
      alert("Selecciona subalmacenes válidos");
      return;
    }
    
    const datosParaEnviar = {
      usuario_id: usuarioId,
      almacenes: subalmacenesValidos.map(subalmacen_id => ({
        subalmacen_id: Number(subalmacen_id),
        limite_ingresos: Number(limiteIngresos) || 1
      }))
    };
    
    console.log('DEBUG AsignarAlmacenesModal - Enviando datos:', datosParaEnviar);
    
    try {
      await onAsignar(datosParaEnviar);
    } catch (error) {
      console.error('ERROR AsignarAlmacenesModal:', error);
      
      // Mostrar error específico al usuario
      if (error.message.includes('Failed to fetch')) {
        alert('❌ Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
      } else if (error.message.includes('404')) {
        alert('❌ Error: El servicio no está disponible. Contacta al administrador.');
      } else if (error.message.includes('401')) {
        alert('❌ Error de autenticación: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // Redirigir al login si hay error 401
        localStorage.removeItem('token');
        window.location.href = '/loginSistema';
      } else if (error.message.includes('Conflicto') || error.message.includes('409')) {
        alert('⚠️ Conflicto de asignación: Algunos de los almacenes seleccionados ya están asignados. Por favor, verifica las asignaciones existentes y selecciona otros almacenes disponibles.');
      } else {
        alert(`❌ Error al asignar almacenes: ${error.message}`);
      }
    }
  };

  const allSelected = subalmacenesFiltrados.length > 0 && subalmacenIds.length === subalmacenesFiltrados.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setSubalmacenIds([]);
    } else {
      setSubalmacenIds(subalmacenesFiltrados.map(sa => String(sa.id)));
    }
  };

  return showModal ? (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-xl mx-4">
        {/* Info del coordinador y almacén seleccionado */}
        <div className="mb-4 text-center">
          {coordinadorNombre && (
            <>
              <div className="font-bold text-lg text-gray-800">Coordinador: {coordinadorNombre}</div>
              <div className="text-sm text-gray-600 mb-2">Rol: Coordinador</div>
            </>
          )}
          {almacenId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
              <div className="text-sm text-blue-600 font-medium">Almacén seleccionado:</div>
              <div className="text-base font-bold text-blue-800">
                {almacenesDisponibles.find(a => String(a.id) === String(almacenId))?.nombre || ''}
              </div>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-bold mb-4 text-center">Asignar Almacenes/Subalmacenes</h3>
        
        <form onSubmit={handleAsignar} className="space-y-4">
          {/* Selector de Almacén */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">Almacén</label>
            <select
              value={almacenId}
              onChange={e => {
                setAlmacenId(e.target.value);
                setSubalmacenIds([]);
              }}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              required
            >
              <option value="">Selecciona un almacén</option>
              {almacenesDisponibles.map(a => (
                <option key={a.id} value={String(a.id)}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {/* Lista de Subalmacenes */}
          {almacenId && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 text-sm">Subalmacenes disponibles</label>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  onClick={handleToggleAll}
                >
                  {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {(Array.isArray(subalmacenesFiltrados) ? subalmacenesFiltrados : []).map(sa => {
                  const selected = subalmacenIds.includes(String(sa.id));
                  return (
                    <div
                      key={sa.id}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all min-h-[40px] ${
                        selected 
                          ? "bg-blue-50 border-blue-300 shadow-sm" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setSubalmacenIds(selected
                          ? subalmacenIds.filter(id => id !== String(sa.id))
                          : [...subalmacenIds, String(sa.id)]
                        );
                      }}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <div className={`w-3 h-3 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selected 
                            ? "bg-blue-600 border-blue-600" 
                            : "border-gray-300"
                        }`}>
                          {selected && (
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`font-medium text-xs ${selected ? "text-blue-800" : "text-gray-700"} truncate`}>
                          {sa.nombre}
                        </span>
                      </div>
                      {selected && (
                        <div className="text-xs bg-blue-100 text-blue-600 px-1 py-1 rounded-full ml-1 flex-shrink-0">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {subalmacenesFiltrados.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No hay subalmacenes disponibles para este almacén
                </div>
              )}

              {/* Límite de ingresos */}
              <div className="mt-4">
                <label className="block mb-2 font-medium text-gray-700 text-sm">Límite de ingresos</label>
                <div className="w-24">
                  <input
                    type="number"
                    value={limiteIngresos}
                    onChange={e => setLimiteIngresos(e.target.value)}
                    min={1}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-center font-medium text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition text-sm"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition disabled:opacity-50 text-sm"
              disabled={loading || !almacenId || subalmacenIds.length === 0}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default AsignarAlmacenesModal;
