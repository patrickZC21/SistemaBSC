import { useEffect, useState } from "react";
import { buildApiUrl } from '../config/security.js';

const useCoordinadores = () => {
  const [coordinadores, setCoordinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoordinadores = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(buildApiUrl("/api/usuarios?rol_id=3"), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/loginSistema";
            return;
          }
          throw new Error("Error al obtener coordinadores");
        }
        const data = await res.json();
        setCoordinadores(data);
      } catch (err) {
        setError("Error al cargar coordinadores");
      } finally {
        setLoading(false);
      }
    };
    fetchCoordinadores();
  }, []);

  // Exponer fetchCoordinadores para refrescar desde fuera
  const refetchCoordinadores = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(buildApiUrl("/api/usuarios?rol_id=3"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Error al obtener coordinadores");
      const data = await res.json();
      setCoordinadores(data);
    } catch (err) {
      setError("Error al cargar coordinadores");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoordinador = async (coordinador) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(buildApiUrl("/api/usuarios"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coordinador),
      });
      if (!res.ok) throw new Error("Error al agregar coordinador");
      const newCoordinador = await res.json();
      setCoordinadores((prev) => [...prev, newCoordinador]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoordinador = async (id, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(buildApiUrl(`/api/usuarios/${id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Error al actualizar coordinador");
      
      // Actualizar el estado local inmediatamente (optimistic update)
      setCoordinadores((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...updatedData }
            : c
        )
      );
    } catch (err) {
      setError(err.message);
      // En caso de error, recargar los datos
      await refetchCoordinadores();
    }
  };

  const handleDeleteCoordinador = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(buildApiUrl(`/api/usuarios/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Error al eliminar coordinador");
      
      // Actualizar el estado local inmediatamente (optimistic update)
      setCoordinadores((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
      // En caso de error, recargar los datos
      await refetchCoordinadores();
    }
  };

  return {
    coordinadores,
    loading,
    error,
    handleAddCoordinador,
    handleUpdateCoordinador,
    handleDeleteCoordinador,
    refetchCoordinadores,
  };
};

export default useCoordinadores;