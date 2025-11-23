import { useEffect, useState } from "react";
import { buildApiUrl, tokenManager, apiRequest } from '../config/app-security.js';

export function useUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = tokenManager.get();
    if (!token) {
      setLoading(false);
      setUsuario(null);
      return;
    }
    
    const url = buildApiUrl('/api/auth/validar');
    apiRequest(url)
      .then((data) => {
        if (data.usuario) setUsuario(data.usuario);
        else setError("No autenticado");
      })
      .catch(() => setError("Error al validar usuario"))
      .finally(() => setLoading(false));
  }, []);

  return { usuario, loading, error };
}
