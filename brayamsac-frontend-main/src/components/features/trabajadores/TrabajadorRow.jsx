import { Edit, Trash2, Check, Pause } from 'lucide-react';

export default function TrabajadorRow({
  trabajador,
  getAlmacenNombre,
  getSubalmacenNombre,
  getCoordinadorNombre,
  onEdit,
  onToggleActivo,
  navigate
}) {
  return (
    <tr
      className={`hover:bg-gray-50 transition-colors cursor-pointer ${trabajador.activo !== 1 ? 'bg-gray-200' : ''}`}
      onClick={() => navigate(`/trabajador/${trabajador.id}`)}
    >
      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{trabajador.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{trabajador.nombre}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{trabajador.dni}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{getAlmacenNombre(trabajador.almacen)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{getSubalmacenNombre(trabajador.subalmacen)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{getCoordinadorNombre(trabajador.coordinador)}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          trabajador.activo === 1
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {trabajador.activo === 1 ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2">
          <button className="inline-flex items-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" onClick={e => {
            e.stopPropagation();
            onEdit(trabajador);
          }}>
            <Edit size={20} />
          </button>
          {/* Puedes agregar aquí el botón de eliminar si lo implementas */}
          <button
            className={`inline-flex items-center p-2 rounded transition
              ${trabajador.activo === 1
                ? 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
            title={trabajador.activo === 1 ? "Desactivar" : "Activar"}
            onClick={e => {
              e.stopPropagation();
              onToggleActivo(trabajador.id, trabajador.activo);
            }}
          >
            {trabajador.activo === 1 ? (
              <Pause size={20} />
            ) : (
              <Check size={20} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}