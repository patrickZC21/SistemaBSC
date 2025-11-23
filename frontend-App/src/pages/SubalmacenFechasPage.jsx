// Página principal para mostrar fechas de subalmacenes
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSubalmacenFechas } from '../hooks/useSubalmacenFechas';
import { SubalmacenFechasList } from '../components/SubalmacenFechasList';
import UserHeader from '../components/UserHeader';
import { useUsuario } from '../hooks/useUsuario';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';

export default function SubalmacenFechasPage() {
  const { subalmacenId } = useParams();
  const { fechas, loading, error } = useSubalmacenFechas(subalmacenId);
  const { usuario, loading: loadingUsuario } = useUsuario();

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      <UserHeader name={usuario?.nombre} role={usuario?.nombre_rol} />
      <div style={{ maxWidth: 450, margin: '40px auto', background: '#f7f8fa', borderRadius: 16, padding: 24 }}>
        <BreadcrumbNavigation 
          subalmacenId={subalmacenId} 
          showFechas={true}
        />
        {loading && <div>Cargando fechas...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
        <SubalmacenFechasList fechas={fechas} subalmacenId={subalmacenId} />
      </div>
    </div>
  );
}
