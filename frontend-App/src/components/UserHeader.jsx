import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logoA.png";
import { tokenManager } from '../config/app-security.js';

const UserHeader = ({ name, role, onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Forzar eliminación del token y todas las banderas de sesión
    tokenManager.forceRemove();

    // Limpiar cualquier dato de sesión adicional
    localStorage.removeItem('usuario');
    localStorage.removeItem('almacen_id');
    localStorage.removeItem('subalmacen_id');
    localStorage.removeItem('mobileSessionPersistent');
    localStorage.removeItem('sessionPersistent');
    localStorage.removeItem('sessionActive');
    localStorage.removeItem('lastActivity');

    // Llamar callback si existe
    if (onLogout) {
      onLogout();
    }

    // Navegar a la ruta raíz (login)
    navigate('/', { replace: true });

    // Forzar recarga después de navegar para limpiar estado
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-8 py-4 border-b bg-white" style={{ borderBottom: "2px solid #e5e7eb" }}>
        <div
          className="text-left cursor-pointer"
          onClick={() => setShowLogout(!showLogout)}
        >
          <div className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            {name}
            <span style={{ fontSize: 10, color: '#888' }}>{showLogout ? '▲' : '▼'}</span>
          </div>
          <div className="text-xs text-gray-400">{role}</div>
        </div>

        <img src={logo} alt="Logo Brayam" className="h-12" />
      </div>

      {/* Menú de logout */}
      {showLogout && (
        <div
          className="absolute left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          style={{ top: '100%', marginTop: 4 }}
        >
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-red-600 font-semibold flex items-center gap-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span>🚪</span>
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Overlay para cerrar el menú */}
      {showLogout && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLogout(false)}
        />
      )}
    </div>
  );
};

export default UserHeader;
