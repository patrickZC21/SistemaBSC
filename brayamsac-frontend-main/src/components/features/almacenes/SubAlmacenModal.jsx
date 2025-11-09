import { X } from 'lucide-react';

const SubAlmacenModal = ({
  show,
  onClose,
  onSubmit,
  nuevoSub,
  onChange,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Agregar Subalmacén</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={nuevoSub.nombre}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Refrigerio</label>
            <input
              type="text"
              name="refrigerio"
              value={nuevoSub.refrigerio || ''}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: 01:00:00"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Jornada</label>
            <input
              type="text"
              name="jornada"
              value={nuevoSub.jornada || ''}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: 09:00:00"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubAlmacenModal;