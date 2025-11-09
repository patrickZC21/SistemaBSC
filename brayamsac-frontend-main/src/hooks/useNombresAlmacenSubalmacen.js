// src/hooks/useNombresAlmacenSubalmacen.js
import { useEffect, useState } from "react";
import { buildApiUrl } from '../config/security.js';
import { rateLimitedFetch } from '../utils/rateLimiter.js';

// Cache para nombres de almacenes
const nombresCache = new Map();
const CACHE_DURATION = 300000; // 5 minutos para nombres

// Reutilizar el cache de usuario del hook useUsuario
const getUserFromCache = () => {
  const userCacheKey = 'user_validation';
  const cached = nombresCache.get(userCacheKey);
  if (cached && (Date.now() - cached.timestamp) < 60000) {
    return cached.data;
  }
  return null;
};

export function useNombresAlmacenSubalmacen(subalmacenId) {
  const [usuario, setUsuario] = useState(null);
  const [almacenNombre, setAlmacenNombre] = useState("");
  const [subalmacenNombre, setSubalmacenNombre] = useState("");

  useEffect(() => {
    // Intentar obtener usuario del cache primero
    const cachedUser = getUserFromCache();
    if (cachedUser) {
      setUsuario(cachedUser);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;
    
    // Solo validar si no hay usuario en cache
    rateLimitedFetch(buildApiUrl("/api/auth/validar"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setUsuario(data.usuario);
        // Guardar en cache
        nombresCache.set('user_validation', {
          data: data.usuario,
          timestamp: Date.now()
        });
      })
      .catch(() => setUsuario(null));
  }, []);

  useEffect(() => {
    if (!subalmacenId) return;
    
    // Verificar cache de nombres primero
    const cacheKey = `nombres_${subalmacenId}`;
    const cached = nombresCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setAlmacenNombre(cached.almacenNombre);
      setSubalmacenNombre(cached.subalmacenNombre);
      return;
    }
    
    const token = localStorage.getItem("token");
    const fetchNombres = async () => {
      try {
        const resSub = await rateLimitedFetch(
          buildApiUrl(`/api/subalmacenes/${subalmacenId}`),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resSub.ok) return;
        const sub = await resSub.json();
        const subNombre = sub.nombre || "";
        let almNombre = "";
        
        setSubalmacenNombre(subNombre);
        
        if (sub.almacen_id) {
          const resAlm = await rateLimitedFetch(
            buildApiUrl(`/api/almacenes/${sub.almacen_id}`),
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (resAlm.ok) {
            const alm = await resAlm.json();
            almNombre = alm.nombre || "";
            setAlmacenNombre(almNombre);
          }
        }
        
        // Guardar en cache
        nombresCache.set(cacheKey, {
          almacenNombre: almNombre,
          subalmacenNombre: subNombre,
          timestamp: Date.now()
        });
        
      } catch {
        setAlmacenNombre("");
        setSubalmacenNombre("");
      }
    };
    fetchNombres();
  }, [subalmacenId]);

  return { usuario, almacenNombre, subalmacenNombre };
}
