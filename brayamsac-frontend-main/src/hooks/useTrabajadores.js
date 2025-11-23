import { useState, useEffect } from 'react';
import { buildApiUrl } from '../config/security.js';

export function useTrabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coordinadores, setCoordinadores] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [subalmacenes, setSubalmacenes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Trabajadores
        const resTrab = await fetch(buildApiUrl('/api/trabajadores'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrabajadores(await resTrab.json());
        // Coordinadores
        const resCoord = await fetch(buildApiUrl('/api/usuarios'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resCoord.ok) {
          const dataCoord = await resCoord.json();
          setCoordinadores(dataCoord.filter(u => u.rol_id === 3));
        }
        // Almacenes
        const resAlm = await fetch(buildApiUrl('/api/almacenes'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resAlm.ok) setAlmacenes(await resAlm.json());
        // Subalmacenes
        const resSub = await fetch(buildApiUrl('/api/subalmacenes'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resSub.ok) setSubalmacenes(await resSub.json());
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return {
    trabajadores, setTrabajadores,
    loading,
    coordinadores,
    almacenes,
    subalmacenes
  };
}