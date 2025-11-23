import { useEffect, useState } from "react";
import { getSubalmacenesAsignadosByAlmacen } from "../services/subalmacenesService";
import { tokenManager } from '../config/app-security.js';

export function useSubalmacenesAsignadosByAlmacen(almacenId) {
  const [subalmacenes, setSubalmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!almacenId) return;
    const token = tokenManager.get();
    getSubalmacenesAsignadosByAlmacen(almacenId, token)
      .then(setSubalmacenes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [almacenId]);

  return { subalmacenes, loading, error };
}
