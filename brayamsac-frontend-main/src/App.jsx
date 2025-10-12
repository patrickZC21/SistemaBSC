import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Almacenes from "./pages/Almacenes";
import ComponenteAsistencia from "./pages/ComponenteAsistencia";
import Coordinadores from "./pages/Coordinadores";
import Dashboard from "./pages/Dashboard";
import TestDashboard from "./pages/TestDashboard";
import LoginSistema from "./pages/LoginSistema";
import RRHH from "./pages/RRHH";
import SubAlmacen from "./pages/SubAlmacen";
import SubalmacenFechasPage from "./pages/SubalmacenFechasPage";
import Trabajador from "./pages/trabajador";
import TrabajadoresLista from "./pages/trabajadoresLista";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSistema />} />
        <Route path="/loginSistema" element={<LoginSistema />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test" element={<TestDashboard />} />
        <Route path="/modern-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/almacenes" element={<Almacenes />} />
        <Route path="/almacenes/:id" element={<SubAlmacen />} />
        <Route path="/subalmacenes/:id/fechas" element={<SubalmacenFechasPage />} />
        <Route path="/asistencias/:subalmacenId/:fecha" element={<ComponenteAsistencia />} /> {/* 👈 ESTA ES LA CORRECTA */}
        <Route path="/coordinadores" element={<Coordinadores />} />
        <Route path="/rrhh" element={<RRHH />} />
        <Route path="/trabajadores" element={<TrabajadoresLista />} />
        <Route path="/trabajador/:id" element={<Trabajador />} />
        <Route path="/trabajadores/nuevo" element={<Trabajador />} /> {/* Nueva ruta añadida */}
      </Routes>
    </BrowserRouter>
  );
}
