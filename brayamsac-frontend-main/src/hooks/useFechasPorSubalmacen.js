// src/hooks/useFechasPorSubalmacen.js
import { useState, useEffect } from "react";
import { buildApiUrl } from '../config/security.js';

export function useFechasPorSubalmacen(subalmacenId) {
  const [fechas, setFechas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [fechasAgregar, setFechasAgregar] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [recargar, setRecargar] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fechaAEliminar, setFechaAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Cargar fechas
  useEffect(() => {
    if (!subalmacenId) return;
    setLoading(true);
    fetch(buildApiUrl(`/api/fechas?subalmacen_id=${subalmacenId}`))
      .then((res) => res.json())
      .then((data) => {
        console.log("[Fechas] Fechas obtenidas:", data); // INFO
        // Ordenar fechas de menor a mayor como respaldo
        const fechasOrdenadas = Array.isArray(data) 
          ? data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          : [];
        setFechas(fechasOrdenadas);
      })
      .catch((error) => {
        console.error("[Fechas] Error al cargar fechas:", error); // ERROR
        setFechas([]);
      })
      .finally(() => setLoading(false));
  }, [subalmacenId, recargar]);

  // Editar
  const handleEditarClick = (f) => {
    setEditandoId(f.id);
    setNuevaFecha(f.fecha?.slice(0, 10) || "");
    console.log(`[Fechas] Editando fecha con id: ${f.id}`); // INFO
  };

  const handleGuardarClick = async (id, nuevaFechaEditada) => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener la fecha actual para preservar subalmacen_id y activo
      const fechaActual = fechas.find(f => f.id === id);
      if (!fechaActual) {
        console.error(`[Fechas] No se encontró la fecha con id ${id}`);
        return;
      }
      
      const res = await fetch(buildApiUrl(`/api/fechas/${id}`), {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          fecha: nuevaFechaEditada,
          subalmacen_id: fechaActual.subalmacen_id,
          activo: fechaActual.activo ?? 1
        }),
      });
      if (res.ok) {
        console.log(`[Fechas] Fecha con id ${id} editada a:`, nuevaFechaEditada); // INFO
        setFechas((prev) => {
          const fechasActualizadas = prev.map((f) => 
            f.id === id ? { ...f, fecha: nuevaFechaEditada } : f
          );
          // Reordenar después de la edición
          return fechasActualizadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        });
      } else {
        const error = await res.text();
        console.error(`[Fechas] Error editando fecha con id ${id}:`, error); // ERROR
      }
    } catch (error) {
      console.error(`[Fechas] Error inesperado editando fecha con id ${id}:`, error); // ERROR
    }
    setEditandoId(null);
    setNuevaFecha("");
  };

  const handleCancelarClick = () => {
    setEditandoId(null);
    setNuevaFecha("");
    console.log("[Fechas] Edición de fecha cancelada"); // INFO
  };

  // Eliminar
  const handleEliminarClick = (f) => {
    setFechaAEliminar(f);
    setShowConfirm(true);
    console.log(`[Fechas] Preparando eliminación de fecha con id: ${f.id}`); // INFO
  };

  const confirmarEliminacion = async () => {
    if (!fechaAEliminar) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/fechas/${fechaAEliminar.id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      if (res.ok) {
        console.log(`[Fechas] Fecha con id ${fechaAEliminar.id} eliminada.`); // INFO
        setFechas((prev) => prev.filter((f) => f.id !== fechaAEliminar.id));
      } else {
        const error = await res.text();
        console.error(`[Fechas] Error eliminando fecha con id ${fechaAEliminar.id}:`, error); // ERROR
      }
    } catch (error) {
      console.error(`[Fechas] Error inesperado eliminando fecha con id ${fechaAEliminar.id}:`, error); // ERROR
    }
    setShowConfirm(false);
    setFechaAEliminar(null);
  };

  const cancelarEliminacion = () => {
    setShowConfirm(false);
    setFechaAEliminar(null);
    console.log("[Fechas] Eliminación cancelada"); // INFO
  };

  // Agregar
  const abrirModalAgregar = () => setAgregando(true);
  const cerrarModalAgregar = () => {
    setAgregando(false);
    setFechasAgregar([]);
    console.log("[Fechas] Cerrando modal de agregar fechas"); // INFO
  };

  const handleAgregarFechas = async () => {
    if (fechasAgregar.length === 0) return;
    
    console.log('⏱️ Iniciando agregado de fechas...', fechasAgregar.length, 'fechas');
    const startTime = performance.now();
    setGuardando(true);

    try {
      const token = localStorage.getItem('token');
      
      // Si hay múltiples fechas, usar el endpoint optimizado
      if (fechasAgregar.length > 1) {
        const res = await fetch(buildApiUrl("/api/fechas/batch"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            fechas: fechasAgregar, 
            subalmacen_id: Number(subalmacenId) 
          }),
        });
        
        if (res.ok) {
          const resultado = await res.json();
          console.log('✅ Respuesta del batch:', resultado);
          
          // Actualizar estado directamente con las fechas creadas
          if (resultado.fechas_creadas && resultado.fechas_creadas.length > 0) {
            setFechas(prev => {
              const fechasNuevas = [...prev, ...resultado.fechas_creadas];
              return fechasNuevas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            });
          }
          
          const endTime = performance.now();
          console.log(`✅ ${resultado.fechas_creadas?.length || 0} fechas agregadas en ${(endTime - startTime).toFixed(2)}ms`);
        } else {
          const error = await res.text();
          console.error("[Fechas] Error del backend en batch:", error);
        }
      } else {
        // Para una sola fecha, usar el endpoint individual
        const fecha = fechasAgregar[0];
        const res = await fetch(buildApiUrl("/api/fechas"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ fecha, subalmacen_id: Number(subalmacenId) }),
        });
        
        if (res.ok) {
          const nueva = await res.json();
          setFechas(prev => {
            const fechasActualizadas = [...prev, nueva];
            return fechasActualizadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
          });
          
          const endTime = performance.now();
          console.log(`✅ 1 fecha agregada en ${(endTime - startTime).toFixed(2)}ms`);
        } else {
          const error = await res.text();
          console.error("[Fechas] Error del backend:", error);
        }
      }
      
    } catch (error) {
      console.error("[Fechas] Error inesperado agregando fechas:", error);
    } finally {
      setFechasAgregar([]);
      setAgregando(false);
      setGuardando(false);
    }
  };

  // Filtrado
  const fechasFiltradas = fechas.filter((f) => {
    if (!busqueda) return true;
    if (!f.fecha) return false;
    const dia = new Date(f.fecha).getDate().toString();
    return dia === busqueda.trim();
  });

  return {
    fechas: fechasFiltradas,
    loading,
    editandoId,
    nuevaFecha,
    agregando,
    fechasAgregar,
    guardando,
    showConfirm,
    fechaAEliminar,
    busqueda,
    setBusqueda,
    setFechasAgregar,
    abrirModalAgregar,
    cerrarModalAgregar,
    handleEditarClick,
    handleGuardarClick,
    handleCancelarClick,
    handleEliminarClick,
    confirmarEliminacion,
    cancelarEliminacion,
    handleAgregarFechas,
  };
}
