// src/services/almacen.service.js
import { buildApiUrl, tokenManager, logger } from '../config/security.js';

// Obtener todos los almacenes
export const getAlmacenes = async (token) => {
  const res = await fetch(buildApiUrl("/api/almacenes"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener almacenes");
  return await res.json();
};

// Crear un nuevo almacén
export const postAlmacen = async (token, data) => {
  const res = await fetch(buildApiUrl("/api/almacenes"), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    logger.error('Respuesta del backend:', errorText);
    throw new Error('Error al crear almacén');
  }
  return await res.json();
};

// Obtener almacén por ID
export const getAlmacenById = async (token, id) => {
  const res = await fetch(buildApiUrl(`/api/almacenes/${id}`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener almacén');
  return await res.json();
};

// Actualizar almacén por ID
export const putAlmacen = async (token, id, data) => {
  const res = await fetch(buildApiUrl(`/api/almacenes/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar almacén');
  return await res.json();
};

// Eliminar almacén por ID
export const deleteAlmacen = async (token, id) => {
  const res = await fetch(buildApiUrl(`/api/almacenes/${id}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    let errorMessage = 'Error al eliminar almacén';
    
    try {
      const parsedError = JSON.parse(errorData);
      errorMessage = parsedError.error || errorMessage;
    } catch {
      // Si no se puede parsear, usar el texto directo
      errorMessage = errorData || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return await res.json();
};
