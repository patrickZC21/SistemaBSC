import React, { useEffect, useState } from "react";
import { buildApiUrl } from '../../../config/security.js';

export default function AgregarRotacionModal({ open, onClose, subalmacenActualId, onAgregar, asistenciasActuales = [], fechaActual }) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSearch("");
    setSelected([]);
    const token = localStorage.getItem('token');
    fetch(buildApiUrl("/api/trabajadores"), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error("No autorizado o error en la petición");
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Respuesta inesperada del servidor");
        }
        setTrabajadores(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Error al cargar trabajadores");
        setTrabajadores([]);
        setLoading(false);
      });
  }, [open]);

  // Filtrar asistencias solo del subalmacén y fecha actual
  const asistenciasFiltradas = asistenciasActuales.filter(a =>
    String(a.subalmacen_id) === String(subalmacenActualId) &&
    (!fechaActual || a.fecha === fechaActual)
  );
  const idsTrabajadoresEnAsistencia = asistenciasFiltradas.map(a => a.trabajador_id || a.id);

  // Debug: mostrar en consola los datos relevantes
  console.log('=== DEBUG MODAL ===');
  console.log('subalmacenActualId:', subalmacenActualId, typeof subalmacenActualId);
  console.log('trabajadores totales:', trabajadores.length);
  console.log('trabajadores completos:', trabajadores);

  // Filtrar trabajadores que NO pertenecen al subalmacén actual
  const trabajadoresDisponibles = Array.isArray(trabajadores)
    ? trabajadores.filter(t => {
        console.log(`Trabajador ${t.nombre || t.id}:`, {
          subalmacen_id: t.subalmacen_id,
          subalmacenActualId: subalmacenActualId,
          esIgual: t.subalmacen_id == subalmacenActualId,
          incluir: t.subalmacen_id != subalmacenActualId
        });
        
        // Mostrar trabajadores cuyo subalmacen_id sea diferente al actual
        // Esto incluirá trabajadores con subalmacen_id = null, 0, etc. si el actual no es null/0
        return t.subalmacen_id != subalmacenActualId;
      })
    : [];

  console.log('Resultado final - trabajadoresDisponibles:', trabajadoresDisponibles.length, trabajadoresDisponibles);

  // Filtrar por búsqueda
  const trabajadoresFiltrados = trabajadoresDisponibles.filter(t => {
    const text = search.toLowerCase();
    return (
      t.nombre?.toLowerCase().includes(text) ||
      t.dni?.toLowerCase().includes(text)
    );
  });

  const toggleSelect = id => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(sid => sid !== id) : [...sel, id]
    );
  };

  const handleAgregar = () => {
    if (selected.length > 0) {
      // Convertir cada ID a un objeto con la estructura esperada
      const trabajadoresSeleccionados = selected.map(id => ({
        id,
        ...trabajadores.find(t => t.id === id)
      }));
      onAgregar(trabajadoresSeleccionados);
      setSelected([]);
    }
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000 }}>
      <div style={{ maxWidth: 480, margin: "60px auto", background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 16px #0002" }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Agregar trabajadores</h2>
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", marginBottom: 16, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        
        {loading && <div style={{ textAlign: "center", color: "#888" }}>Cargando...</div>}
        {error && <div style={{ color: "#dc2626", textAlign: "center" }}>{error}</div>}
        
        {!loading && !error && (
          <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 16 }}>
            {trabajadoresFiltrados.length === 0 && (
              <div style={{ color: "#888", textAlign: "center" }}>No hay trabajadores disponibles</div>
            )}
            {trabajadoresFiltrados.map(t => (
              <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #eee" }}>
                <input
                  type="checkbox"
                  checked={selected.includes(t.id)}
                  onChange={() => toggleSelect(t.id)}
                />
                <span style={{ fontWeight: 600 }}>{t.nombre}</span>
                <span style={{ color: "#555", fontSize: 13 }}>DNI: {t.dni}</span>
                <span style={{ color: "#888", fontSize: 13 }}>
                  Subalmacén: {t.subalmacen || 'Sin asignar'}
                </span>
              </label>
            ))}
          </div>
        )}
        
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: 0, background: "#eee", fontWeight: 600 }}>Cancelar</button>
          <button
            onClick={handleAgregar}
            style={{ 
              padding: "8px 18px", 
              borderRadius: 6, 
              border: 0, 
              background: selected.length === 0 ? "#ccc" : "#0a194e", 
              color: "#fff", 
              fontWeight: 600,
              cursor: selected.length === 0 ? "not-allowed" : "pointer"
            }}
            disabled={selected.length === 0}
          >
            Agregar ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}
