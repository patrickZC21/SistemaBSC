import React from 'react';

const AlmacenDropdown = ({
  nombreAlmacen,
  dropdownRef,
  dropdownOpen,
  setDropdownOpen,
  almacenes,
  id,
  navigate,
}) => (
  <div className="mb-4">
    <label className="block text-gray-700 mb-1">Nombre del almacén</label>
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full border border-gray-400 rounded px-3 py-2 bg-gray-50 focus:outline-none cursor-pointer"
        onClick={() => setDropdownOpen((open) => !open)}
        title="Cambiar almacén"
      >
        <span className="font-semibold text-gray-700">{nombreAlmacen}</span>
        <svg className={`w-5 h-5 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdownOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-30">
          <ul>
            {almacenes.map((almacen) => (
              <li key={almacen.id}>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-blue-100 transition ${
                    String(almacen.id) === String(id) ? 'bg-blue-50 font-bold text-blue-700' : ''
                  }`}
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(`/almacenes/${almacen.id}`);
                  }}
                >
                  {almacen.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

export default AlmacenDropdown;