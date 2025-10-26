import { useEffect, useState } from "react";

export default function ModernDashboardCards({ almacenes, subalmacenes, coordinadores, trabajadores }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Almacenes Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{almacenes}</p>
            <p className="text-sm text-blue-600 font-medium">+5% vs mes anterior</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Almacenes</h3>
          <p className="text-sm text-gray-500">Total de almacenes activos</p>
        </div>
      </div>

      {/* Subalmacenes Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{subalmacenes}</p>
            <p className="text-sm text-purple-600 font-medium">+12% vs mes anterior</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Subalmacenes</h3>
          <p className="text-sm text-gray-500">Subdivisiones registradas</p>
        </div>
      </div>

      {/* Coordinadores Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-xl">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{coordinadores}</p>
            <p className="text-sm text-orange-600 font-medium">Estable</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Coordinadores</h3>
          <p className="text-sm text-gray-500">Coordinadores activos</p>
        </div>
      </div>

      {/* Trabajadores Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{trabajadores}</p>
            <p className="text-sm text-green-600 font-medium">+3% vs mes anterior</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Trabajadores</h3>
          <p className="text-sm text-gray-500">Personal activo total</p>
        </div>
      </div>
    </div>
  );
}
