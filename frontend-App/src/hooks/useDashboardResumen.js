import { useEffect, useState } from "react";
import { getDashboardResumen } from "../services/dashboard.service";

export function useDashboardResumen() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getDashboardResumen()
      .then((data) => {
        setResumen(data);
        setError(null);
      })
      .catch((err) => setError(err.message || "Error al cargar resumen"))
      .finally(() => setLoading(false));
  }, []);

  return { resumen, loading, error };
}
