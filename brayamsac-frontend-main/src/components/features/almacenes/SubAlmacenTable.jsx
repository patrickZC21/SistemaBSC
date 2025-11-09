import { Check, X, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubAlmacenTable = ({
  subalmacenes,
  editId,
  editNombre,
  editRefrigerio,
  editJornada,
  setEditNombre,
  setEditRefrigerio,
  setEditJornada,
  handleEdit,
  handleCancelEdit,
  handleSaveEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-0 overflow-hidden">
      <div className="relative">
        <table className="min-w-full">
          <thead>
            <tr style={{ background: "#1a2233" }}>
              <th className="px-6 py-4 text-left text-white font-semibold text-sm" style={{ width: '40%' }}>
                Nombre del Subalmacén
              </th>
              <th className="px-6 py-4 text-center text-white font-semibold text-sm" style={{ width: '20%' }}>
                Refrigerio
              </th>
              <th className="px-6 py-4 text-center text-white font-semibold text-sm" style={{ width: '20%' }}>
                Jornada
              </th>
              <th className="px-6 py-4 text-center text-white font-semibold text-sm" style={{ width: '20%' }}>
                Acciones
              </th>
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto max-h-[326px]">
          <table className="min-w-full">
            <tbody>
              {subalmacenes.map((sub) => (
                <tr
                  key={sub.id}
                  className={`border-b border-gray-300 last:border-none transition ${
                    editId === sub.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-200 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (editId !== sub.id)
                      navigate(`/subalmacenes/${sub.id}/fechas`);
                  }}
                >
                  <td className="px-6 py-4 text-gray-800 whitespace-nowrap text-sm font-medium" style={{ width: '40%' }}>
                    {editId === sub.id ? (
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      sub.nombre
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 whitespace-nowrap text-sm" style={{ width: '20%' }}>
                    {editId === sub.id ? (
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={editRefrigerio}
                        onChange={(e) => setEditRefrigerio(e.target.value)}
                        placeholder="Refrigerio"
                      />
                    ) : (
                      sub.refrigerio || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 whitespace-nowrap text-sm" style={{ width: '20%' }}>
                    {editId === sub.id ? (
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={editJornada}
                        onChange={(e) => setEditJornada(e.target.value)}
                        placeholder="Jornada"
                      />
                    ) : (
                      sub.jornada || '-'
                    )}
                  </td>
                  <td
                    className="px-6 py-4 text-center"
                    style={{ width: '20%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-2 items-center justify-center">
                    {editId === sub.id ? (
                      <>
                        <button
                          className="inline-flex items-center px-2 py-1 text-green-600 hover:bg-green-50 rounded transition"
                          title="Guardar"
                          onClick={() => handleSaveEdit(sub)}
                        >
                          <Check />
                        </button>
                        <button
                          className="inline-flex items-center px-2 py-1 text-red-500 hover:bg-red-50 rounded transition"
                          title="Cancelar"
                          onClick={handleCancelEdit}
                        >
                          <X />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="inline-flex items-center px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Editar"
                          onClick={() => handleEdit(sub)}
                        >
                          <Edit />
                        </button>
                        <button
                          className="inline-flex items-center px-2 py-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition"
                          title="Eliminar"
                          onClick={() => onDelete(sub.id)}
                        >
                          <Trash2 />
                        </button>
                      </>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
              {subalmacenes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                    No hay subalmacenes para este almacén.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="text-sm text-gray-400 mt-3 px-6 pb-4">
          Mostrando {subalmacenes.length} subalmacenes
        </div>
      </div>
    </div>
  );
};

export default SubAlmacenTable;
