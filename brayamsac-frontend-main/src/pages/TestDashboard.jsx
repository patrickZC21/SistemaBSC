import React from 'react';

export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ✅ Dashboard Test
        </h1>
        <p className="text-gray-600 mb-4">
          Si ves este mensaje, la aplicación está funcionando correctamente.
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Estado:</strong> Aplicación cargada exitosamente
        </div>
      </div>
    </div>
  );
}
