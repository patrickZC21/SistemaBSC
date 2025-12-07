import React from 'react';

const ConfirmModal = ({ show, onConfirm, onCancel, title, message, mensaje, additionalComment }) => {
  if (!show) return null;
  
  // Acepta tanto 'message' como 'mensaje' para compatibilidad
  const displayMessage = message || mensaje;
  
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-lg font-bold mb-4 text-red-600 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {title || 'Confirmar eliminación'}
        </h2>
        <p className="mb-4 text-gray-700">{displayMessage || '¿Está seguro de que desea eliminar este elemento?'}</p>
        {additionalComment && (
          <p className="mb-6 text-sm text-gray-600 italic bg-gray-50 p-3 rounded-md">
            💡 {additionalComment}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            onClick={onConfirm}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;