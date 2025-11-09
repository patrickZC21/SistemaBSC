import React from 'react';

const CoordinadorAddModal = ({
  showModal,
  setShowModal,
  handleAgregar,
  form,
  handleChange,
  loading
}) => {
  return (
    showModal && (
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Agregar Coordinador</h3>
          <form onSubmit={handleAgregar} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block mb-1 font-medium">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block mb-1 font-medium">Correo</label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default CoordinadorAddModal;
