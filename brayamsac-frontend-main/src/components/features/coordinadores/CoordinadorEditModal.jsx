import React from 'react';

const CoordinadorEditModal = ({
  isOpen,
  onClose,
  coordinador,
  onSave,
  almacenesDisponibles = [],
  subalmacenesDisponibles = [],
  asignacionesActuales = {}, // { almacenId, subalmacenIds: [], limite_ingresos: '' }
}) => {
  // Estado para datos básicos
  const [formData, setFormData] = React.useState({
    nombre: '',
    correo: '',
    password: '',
  });
  // Estado para almacén, subalmacenes y límite de ingresos
  const [almacenId, setAlmacenId] = React.useState('');
  const [subalmacenIds, setSubalmacenIds] = React.useState([]);
  const [limiteIngresos, setLimiteIngresos] = React.useState('1');

  React.useEffect(() => {
    if (coordinador) {
      setFormData({
        nombre: coordinador.nombre || '',
        correo: coordinador.correo || '',
        password: coordinador.password || '',
      });
    }
    if (asignacionesActuales) {
      setAlmacenId(asignacionesActuales.almacenId ? String(asignacionesActuales.almacenId) : '');
      setSubalmacenIds(
        Array.isArray(asignacionesActuales.subalmacenIds)
          ? asignacionesActuales.subalmacenIds.map(String)
          : []
      );
      setLimiteIngresos(asignacionesActuales.limite_ingresos ? String(asignacionesActuales.limite_ingresos) : '1');
    }
  }, [coordinador, asignacionesActuales]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAlmacenChange = (e) => {
    setAlmacenId(e.target.value);
    setSubalmacenIds([]); // Limpiar subalmacenes al cambiar almacén
  };

  const handleSubalmacenToggle = (id) => {
    setSubalmacenIds((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };

  const subalmacenesFiltrados = subalmacenesDisponibles.filter(
    (sa) => String(sa.almacen_id) === String(almacenId)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!coordinador) return;
    onSave({
      ...coordinador,
      ...formData,
      almacenId,
      subalmacenIds,
      limite_ingresos: limiteIngresos,
    });
  };

  if (!isOpen || !coordinador) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Editar Coordinador</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datos básicos */}
          <div>
            <label className="block mb-1 font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Correo</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          {/* Selección de almacén */}
          <div>
            <label className="block mb-1 font-medium">Almacén</label>
            <select
              value={almacenId}
              onChange={handleAlmacenChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Selecciona un almacén</option>
              {almacenesDisponibles.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          {/* Selección de subalmacenes */}
          {almacenId && (
            <div>
              <label className="block mb-1 font-medium">Subalmacenes</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                {subalmacenesFiltrados.length === 0 && (
                  <div className="text-gray-400 text-sm">No hay subalmacenes para este almacén</div>
                )}
                {subalmacenesFiltrados.map((sa) => (
                  <label key={sa.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subalmacenIds.includes(String(sa.id))}
                      onChange={() => handleSubalmacenToggle(String(sa.id))}
                    />
                    <span>{sa.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Límite de ingresos general */}
          <div>
            <label className="block mb-1 font-medium">Límite de ingresos</label>
            <input
              type="number"
              min={1}
              className="w-full border px-3 py-2 rounded"
              value={limiteIngresos}
              onChange={e => setLimiteIngresos(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoordinadorEditModal;