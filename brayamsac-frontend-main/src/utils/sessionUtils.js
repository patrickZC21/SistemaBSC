/**
 * Utilidades para el manejo de sesiones
 * 
 * Este archivo contiene funciones para gestionar el estado de la sesión
 * de usuario, verificar tokens, y manejar el cierre de sesión.
 */

import { buildApiUrl } from '../config/api.js';

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} - true si hay una sesión activa, false en caso contrario
 */
export const verificarSesionActiva = () => {
  const token = localStorage.getItem('token');
  const nombre = localStorage.getItem('nombre');
  const rol = localStorage.getItem('rol');
  
  return Boolean(token && nombre && rol);
};

/**
 * Calcula el tiempo restante de un token JWT en minutos
 * @returns {number|null} - Minutos restantes o null si no hay token o es inválido
 */
export const calcularTiempoRestanteToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Dividir el token y obtener el payload
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    
    if (!decodedPayload.exp) return null;
    
    const expDate = new Date(decodedPayload.exp * 1000);
    const now = new Date();
    
    if (now > expDate) return 0; // Ya expiró
    
    const timeRemaining = expDate - now;
    return Math.floor(timeRemaining / 60000); // Convertir a minutos
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

/**
 * Limpia todos los datos de sesión del localStorage
 */
export const limpiarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nombre');
  localStorage.removeItem('rol');
};

/**
 * Registra el estado actual de la sesión en la consola
 */
export const logEstadoSesion = () => {
  const token = localStorage.getItem('token');
  const nombre = localStorage.getItem('nombre');
  const rol = localStorage.getItem('rol');
  const tiempoRestante = calcularTiempoRestanteToken();
  
  console.group('Estado de sesión');
  console.log('Token:', token ? '✅ Presente' : '❌ Ausente');
  console.log('Nombre:', nombre || 'No disponible');
  console.log('Rol:', rol || 'No disponible');
  
  if (tiempoRestante !== null) {
    console.log('Tiempo restante:', tiempoRestante, 'minutos');
  } else {
    console.log('Tiempo restante: No disponible');
  }
  
  console.log('Sesión activa:', verificarSesionActiva() ? '✅ Sí' : '❌ No');
  console.groupEnd();
};

/**
 * Realiza una validación del token con el backend
 * @returns {Promise<{valido: boolean, usuario: object|null, error: string|null}>}
 */
export const validarTokenConBackend = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { valido: false, usuario: null, error: 'No hay token disponible' };
  }
  
  try {
    // Usar la configuración centralizada de API
    const apiUrl = buildApiUrl('/api/auth/validar');
    
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { valido: true, usuario: data.usuario, error: null };
    } else {
      return { valido: false, usuario: null, error: data.error || 'Token inválido' };
    }
  } catch (error) {
    return { valido: false, usuario: null, error: error.message || 'Error de conexión' };
  }
};