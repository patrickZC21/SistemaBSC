import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmDeleteModal = ({ 
  show, 
  onConfirm, 
  onCancel, 
  almacenNombre,
  loading 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Eliminar Almacén
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            ¿Estás seguro que deseas eliminar el almacén{' '}
            <span className="font-semibold text-red-600">"{almacenNombre}"</span>?
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Importante:</strong> No podrás eliminar el almacén si:
            </p>
            <ul className="text-sm text-amber-700 mt-2 ml-4 list-disc">
              <li>Tiene subalmacenes asociados</li>
              <li>Tiene asistencias registradas</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
