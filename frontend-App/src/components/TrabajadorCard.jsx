import React from "react";

const TrabajadorCard = ({
  nombre,
  dni,
  children
}) => (
  <div style={{ padding: '18px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafbfc' }}>
    <div>
      <div style={{ fontWeight: 700, fontSize: 22 }}>{nombre}</div>
      <div style={{ fontSize: 16, color: '#555', marginBottom: 16 }}>DNI: {dni}</div>
    </div>
    {children}
  </div>
);

export default TrabajadorCard;
