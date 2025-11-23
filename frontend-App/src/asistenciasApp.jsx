import React from "react";
import AsistenciasPage from "./pages/AsistenciasPage";
import UserHeader from "./components/UserHeader";

const usuario = {
  nombre: "Fernanda torres",
  rol: "COORDINADOR",
};

const AsistenciasApp = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#fafbfc" }}>
      <UserHeader name={usuario.nombre} role={usuario.rol} />
      <main style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <AsistenciasPage />
      </main>
    </div>
  );
};

export default AsistenciasApp;
