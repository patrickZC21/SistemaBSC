
import { Warehouse, Blinds, UserCog, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardCards({ almacenes, subalmacenes, coordinadores, trabajadores }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Almacenes Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Warehouse className="w-8 h-8 text-blue-600" />
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
            <Blinds className="w-8 h-8 text-purple-600" />
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
            <UserCog className="w-8 h-8 text-orange-600" />
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
            <Dumbbell className="w-8 h-8 text-green-600" />
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
