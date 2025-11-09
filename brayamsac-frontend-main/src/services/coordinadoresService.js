import { buildApiUrl, tokenManager, logger } from '../config/security.js';

export const fetchCoordinadores = async () => {
  const token = tokenManager.get();
  const response = await fetch(buildApiUrl('/api/usuarios?rol_id=3'), {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Error fetching coordinadores');
  }
  return response.json();
};

export const addCoordinador = async (coordinador) => {
  const token = localStorage.getItem('token');
  // Asegúrate de incluir rol_id: 3 en el objeto coordinador
  const response = await fetch(buildApiUrl('/api/usuarios'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...coordinador, rol_id: 3 }),
  });
  if (!response.ok) {
    throw new Error('Error adding coordinador');
  }
  return response.json();
};

export const updateCoordinador = async (id, coordinador) => {
  const token = tokenManager.get();
  const response = await fetch(buildApiUrl(`/api/usuarios/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...coordinador, rol_id: 3 }),
  });
  if (!response.ok) {
    throw new Error('Error updating coordinador');
  }
  return response.json();
};

export const deleteCoordinador = async (id) => {
  const token = tokenManager.get();
  const response = await fetch(buildApiUrl(`/api/usuarios/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Error deleting coordinador');
  }
  return response.json();
};

export const fetchAlmacenes = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación. Inicia sesión de nuevo.');
  }
  try {
    const response = await fetch(buildApiUrl('/api/almacenes'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Error al obtener almacenes. El servidor respondió con un error.');
    }
    return response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      // Error de red, servidor caído o CORS
      throw new Error('No se pudo conectar con el servidor de almacenes. ¿Está el backend corriendo?');
    }
    throw error;
  }
};

export async function fetchSubalmacenes() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación. Inicia sesión de nuevo.');
  }
  const res = await fetch(buildApiUrl("/api/subalmacenes"), {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  return await res.json();
}

export const asignarAlmacenesUsuario = async ({ usuario_id, almacenes }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
  }
  
  try {
    const url = buildApiUrl(`/api/usuario-almacenes`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ usuario_id, almacenes })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      
      // Manejar diferentes tipos de error
      if (response.status === 401) {
        throw new Error('Error de autenticación: Tu sesión ha expirado');
      } else if (response.status === 400) {
        throw new Error(`Error en los datos enviados: ${errorData}`);
      } else if (response.status === 404) {
        throw new Error('El servicio de asignación no está disponible');
      } else if (response.status === 409) {
        throw new Error('Conflicto: Algunos almacenes ya están asignados a este usuario o a otro usuario. Verifica las asignaciones existentes.');
      } else {
        throw new Error(`Error del servidor (${response.status}): ${errorData}`);
      }
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    // Si es un error de red (Failed to fetch)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
    }
    
    // Re-lanzar otros errores
    throw error;
  }
};