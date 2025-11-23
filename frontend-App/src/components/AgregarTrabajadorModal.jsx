import React, { useState } from "react";

const AgregarTrabajadorModal = ({ open, onClose, trabajadores, onAgregar }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  if (!open) return null;

  // Filtrar trabajadores por nombre, apellido o DNI
  const filtered = trabajadores.filter(t => {
    const text = search.toLowerCase();
    return (
      t.nombre?.toLowerCase().includes(text) ||
      t.apellido?.toLowerCase().includes(text) ||
      t.dni?.toLowerCase().includes(text)
    );
  });

  const toggleSelect = id => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(sid => sid !== id) : [...sel, id]
    );
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000 }}>
      <div style={{ maxWidth: 480, margin: "60px auto", background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 16px #0002" }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Agregar trabajadores</h2>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", marginBottom: 16, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 16 }}>
          {filtered.length === 0 && <div style={{ color: "#888", textAlign: "center" }}>No hay trabajadores disponibles</div>}
          {filtered.map(t => (
            <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() => toggleSelect(t.id)}
              />
              <span style={{ fontWeight: 600 }}>{t.nombre} {t.apellido}</span>
              <span style={{ color: "#555", fontSize: 13 }}>DNI: {t.dni}</span>
              <span style={{ color: "#888", fontSize: 13 }}>Subalmacén: {t.subalmacen || t.subalmacen_id || JSON.stringify(t)}</span>
            </label>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: 0, background: "#eee", fontWeight: 600 }}>Cancelar</button>
          <button
            onClick={() => onAgregar(selected)}
            style={{ padding: "8px 18px", borderRadius: 6, border: 0, background: "#0a194e", color: "#fff", fontWeight: 600 }}
            disabled={selected.length === 0}
          >Agregar</button>
        </div>
      </div>
    </div>
  );
};

export default AgregarTrabajadorModal;
