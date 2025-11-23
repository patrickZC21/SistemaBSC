import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "../components/AuthGuard";
import DashboardApp from "./DashboardApp";
import DashboardMain from "../components/DashboardMain";
import SubalmacenesPage from "./SubalmacenesPage";
import SubalmacenesPorAlmacenPage from "./SubalmacenesPorAlmacenPage";
import SubalmacenFechasPage from "./SubalmacenFechasPage";
import AsistenciasPorFechaPage from "./AsistenciasPorFechaPage";
import MobileNavigationHandler from "../components/MobileNavigationHandler";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MobileNavigationHandler>
        <Routes>
          <Route path="/" element={<AuthGuard />} />
          <Route path="/dashboard-app" element={<DashboardApp />} />
          <Route path="/dashboard-main" element={<DashboardMain />} />
          <Route path="/subalmacenes" element={<SubalmacenesPage />} />
          <Route path="/subalmacenes/:id" element={<SubalmacenesPorAlmacenPage />} />
          <Route path="/subalmacenes/:subalmacenId/fechas" element={<SubalmacenFechasPage />} />
          <Route path="/subalmacenes/:subalmacenId/fechas/:fecha" element={<AsistenciasPorFechaPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MobileNavigationHandler>
    </BrowserRouter>
  );
}
