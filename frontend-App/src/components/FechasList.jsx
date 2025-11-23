import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const FechasList = ({ fechas }) => {
  const navigate = useNavigate();
  const { subalmacenId } = useParams();

  return (
    <div style={{ marginBottom: 32, marginTop: 8 }}>
      {fechas.map((fecha) => (
        <div
          key={fecha}
          onClick={() => navigate(`/subalmacenes/${subalmacenId}/fechas/${fecha}`)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 12px #0002",
            marginBottom: 24,
            padding: "22px 32px",
            cursor: "pointer",
            borderLeft: "6px solid #2196f3",
            fontSize: 22,
            color: "#222",
            transition: "box-shadow 0.2s, border-color 0.2s",
          }}
        >
          <span>{fecha}</span>
          <span style={{ color: "#bbb", fontSize: 28, fontWeight: 300, marginLeft: 16 }}>&#8250;</span>
        </div>
      ))}
    </div>
  );
};

export default FechasList;
