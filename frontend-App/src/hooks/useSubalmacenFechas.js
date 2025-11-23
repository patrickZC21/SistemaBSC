// Hook para obtener fechas de un subalmacen
import { useEffect, useState } from 'react';
import { getSubalmacenFechas } from '../services/subalmacenFechas.service';

export function useSubalmacenFechas(subalmacenId) {
  const [fechas, setFechas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subalmacenId) return;
    setLoading(true);
    getSubalmacenFechas(subalmacenId)
      .then(setFechas)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [subalmacenId]);

  return { fechas, loading, error };
}
