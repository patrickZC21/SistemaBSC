import React, { useState } from "react";
import logo from "../assets/img/logoA.png"; // tu logo
import NotificationMessage from './NotificationMessage';
import { buildApiUrl, apiRequest, logger } from '../config/app-security.js';

export default function LoginForm({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConflictOptions, setShowConflictOptions] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    setShowConflictOptions(false);
    
    // Validaciones básicas
    if (!usuario.trim()) {
      setError("Por favor ingresa tu correo electrónico.");
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña.");
      setLoading(false);
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario)) {
      setError("Por favor ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }
    
    try {
      const url = buildApiUrl('/api/auth/login');
      const data = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({ correo: usuario.trim(), contraseña: password }),
      });
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!data) {
        throw new Error("Respuesta vacía del servidor");
      }
      
      // Validar token
      if (!data.token) {
        throw new Error("No se recibió token de autenticación");
      }
      
      // Validar usuario y rol
      if (!data.usuario) {
        throw new Error("No se recibió información del usuario");
      }
      
      if (!data.usuario.nombre_rol) {
        throw new Error("No se pudo verificar el rol del usuario");
      }
      
      const rol = data.usuario.nombre_rol.toUpperCase();
      if (rol !== "COORDINADOR") {
        setError(`Acceso denegado. Solo los usuarios con rol COORDINADOR pueden ingresar. Tu rol actual es: ${data.usuario.nombre_rol}`);
        return;
      }
      
      // Login exitoso
      setSuccessMessage("¡Login exitoso! Redirigiendo...");
      logger.log('Login exitoso para usuario:', data.usuario.correo);
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        if (onLogin) {
          onLogin(data);
        }
      }, 1500);
      
    } catch (err) {
      logger.error('Error en login:', err);
      
      // Manejo específico de errores
      if (err.status === 409) {
        // Conflicto de sesión activa
        setShowConflictOptions(true);
        setError("Ya existe una sesión activa con esta cuenta.");
      } else if (err.status === 401) {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else if (err.status === 403) {
        setError("Acceso denegado. Contacta al administrador.");
      } else if (err.status === 404) {
        setError("Usuario no encontrado. Verifica tu correo electrónico.");
      } else if (err.status >= 500) {
        setError("Error del servidor. Intenta nuevamente en unos momentos.");
      } else if (err.message.includes('timeout') || err.message.includes('tardó demasiado')) {
        setError("La conexión tardó demasiado tiempo. Verifica tu conexión a internet.");
      } else {
        setError(err.message || "Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para forzar el login cerrando la sesión anterior
  const handleForceLogin = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);
    setShowConflictOptions(false);
    
    try {
      // Validar datos antes de proceder
      if (!usuario.trim() || !password.trim()) {
        throw new Error("Datos de usuario incompletos");
      }
      
      // Primero intentar cerrar cualquier sesión activa
      setSuccessMessage("Cerrando sesión anterior...");
      const logoutUrl = buildApiUrl('/api/auth/force-logout');
      
      try {
        await apiRequest(logoutUrl, {
          method: "POST",
          body: JSON.stringify({ correo: usuario.trim() }),
        });
        logger.log('Sesión anterior cerrada exitosamente');
      } catch (logoutErr) {
        // Si falla el logout, continuamos con el login
        logger.warn('No se pudo cerrar la sesión anterior:', logoutErr.message);
      }
      
      setSuccessMessage("Intentando iniciar sesión...");
      
      // Esperar un momento antes del login
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Intentar login nuevamente
      const loginUrl = buildApiUrl('/api/auth/login');
      const data = await apiRequest(loginUrl, {
        method: "POST",
        body: JSON.stringify({ correo: usuario.trim(), contraseña: password }),
      });
      
      // Verificar respuesta
      if (!data || !data.token || !data.usuario) {
        throw new Error("Respuesta inválida del servidor");
      }
      
      // Validar rol
      if (!data.usuario.nombre_rol) {
        throw new Error("No se pudo verificar el rol del usuario");
      }
      
      const rol = data.usuario.nombre_rol.toUpperCase();
      if (rol !== "COORDINADOR") {
        setError(`Acceso denegado. Solo los usuarios con rol COORDINADOR pueden ingresar. Tu rol actual es: ${data.usuario.nombre_rol}`);
        return;
      }
      
      // Login exitoso
      setSuccessMessage("¡Login exitoso! Redirigiendo...");
      logger.log('Login forzado exitoso para usuario:', data.usuario.correo);
      
      setTimeout(() => {
        if (onLogin) {
          onLogin(data);
        }
      }, 1500);
      
    } catch (err) {
      logger.error('Error al forzar el login:', err);
      
      // Manejo específico de errores para force login
      if (err.status === 401) {
        setError("Credenciales incorrectas. No se puede forzar el login con datos incorrectos.");
      } else if (err.status === 403) {
        setError("Acceso denegado. No tienes permisos para realizar esta acción.");
      } else if (err.status >= 500) {
        setError("Error del servidor. No se pudo completar el proceso.");
      } else if (err.message.includes('timeout') || err.message.includes('tardó demasiado')) {
        setError("La operación tardó demasiado tiempo. Intenta nuevamente.");
      } else {
        setError(err.message || "Error al forzar el login. Intenta nuevamente.");
      }
      
      // Mostrar opciones nuevamente si el error persiste
      setShowConflictOptions(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center pt-32">
      {/* Logo */}
      <img src={logo} alt="Logo Brayam" className="h-34 mb-8" />
      <h2 className="text-2xl font-bold mb-2 text-center">
        Bienvenido a BrayamSAC!{" "}
        <span className="inline-block">👋</span>
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Ahora tienes acceso a la aplicación de BrayamSAC
      </p>
      <form
        className="w-full max-w-xs flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="text-xs font-bold mb-1 block text-gray-700">Correo de la empresa</label>
          <input
            type="email"
            className={`w-full border rounded-md px-3 py-2 outline-none bg-white transition-colors ${
              error && !usuario.trim() 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="ejemplo@empresa.com"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value);
              if (error) setError(""); // Limpiar error al escribir
            }}
            disabled={loading}
            required
            autoComplete="email"
            aria-describedby={error ? "email-error" : undefined}
          />
        </div>
        <div>
          <label className="text-xs font-bold mb-1 block text-gray-700">Contraseña</label>
          <input
            type="password"
            className={`w-full border rounded-md px-3 py-2 outline-none bg-white transition-colors ${
              error && !password.trim() 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(""); // Limpiar error al escribir
            }}
            disabled={loading}
            required
            autoComplete="current-password"
            aria-describedby={error ? "password-error" : undefined}
          />
        </div>
        {error && (
          <NotificationMessage 
            type="error" 
            message={error} 
            onClose={() => setError("")}
          />
        )}
        
        {successMessage && (
          <NotificationMessage 
            type="success" 
            message={successMessage} 
            onClose={() => setSuccessMessage("")}
          />
        )}
        
        {/* Opciones para manejar conflicto de sesión */}
        {showConflictOptions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
            <div className="flex items-start mb-3">
              <span className="mr-2 text-sm">⚠️</span>
              <div>
                <p className="text-xs text-yellow-800 font-semibold mb-1">
                  Sesión Activa Detectada
                </p>
                <p className="text-xs text-yellow-700">
                  Ya hay una sesión activa con esta cuenta. Esto puede suceder si no cerraste sesión correctamente la vez anterior.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleForceLogin}
                className="bg-orange-500 text-white font-bold py-2 px-4 rounded text-xs transition hover:bg-orange-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Cerrando sesión anterior..." : "🔄 Cerrar sesión anterior e ingresar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConflictOptions(false);
                  setError("");
                }}
                className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-xs transition hover:bg-gray-400"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        <button
          type="submit"
          className={`w-full font-bold py-4 rounded-full mt-12 transition-all duration-200 shadow-md tracking-wider text-base ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#07a1e4] hover:bg-[#138abe] hover:shadow-lg active:transform active:scale-95'
          }`}
          style={{ boxShadow: loading ? 'none' : '0 4px 12px 0 rgba(7, 161, 228, 0.3)' }}
          disabled={loading || !usuario.trim() || !password.trim()}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Ingresando...
            </div>
          ) : (
            "INGRESAR"
          )}
        </button>
      </form>
    </div>
  );
}
