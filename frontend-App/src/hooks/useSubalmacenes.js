import { useEffect, useState } from "react";
import { getSubalmacenes } from "../services/subalmacenesService";
import { tokenManager } from '../config/app-security.js';

export function useSubalmacenes() {
  const [subalmacenes, setSubalmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = tokenManager.get();
    getSubalmacenes(token)
      .then(setSubalmacenes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { subalmacenes, loading, error };
}
