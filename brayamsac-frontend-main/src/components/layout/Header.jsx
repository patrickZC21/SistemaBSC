import useAutoLogout from '../../hooks/useAutoLogout';

export default function Header({ usuario }) {
  const { manualLogout } = useAutoLogout();

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await manualLogout();
    }
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Sistema de control de asistencia de BRAYAM SAC
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dashboard Analítico • {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {usuario?.nombre || "Usuario"}
          </p>
          <p className="text-xs text-gray-500">
            {usuario?.nombre_rol || usuario?.rol || "Sin rol"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
          {usuario?.nombre?.[0]?.toUpperCase() || "U"}
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center space-x-2"
          title="Cerrar sesión"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-medium hidden sm:block">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
