import React from "react";
import { logger } from '../config/app-security.js';

const AsistenciaHeader = ({ titulo, descripcion, showSearch, showAddButton, searchText, setSearchText, onAddButtonClick }) => (
  <>
    <div style={{ marginBottom: 12 }}>
      {showSearch && (
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          value={typeof searchText !== 'undefined' ? searchText : ''}
          onChange={e => typeof setSearchText === 'function' && setSearchText(e.target.value)}
        />
      )}
      {showAddButton && (
        <button
          style={{ width: "100%", marginTop: 8, background: "#0a194e", color: "#fff", border: 0, borderRadius: 6, padding: 10, fontWeight: 600, cursor: 'pointer' }}
          onClick={() => {
            logger.log('Botón +Añadir trabajador presionado');
            if (typeof onAddButtonClick === 'function') {
              onAddButtonClick();
            } else {
              alert('No se ha definido la acción para agregar trabajador');
            }
          }}
        >
          +Añadir trabajador
        </button>
      )}
    </div>
    <div style={{ fontWeight: 700, fontSize: 18, margin: '16px 0 8px 0' }}>{titulo}</div>
    <div style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{descripcion}</div>
  </>
);

export default AsistenciaHeader;
