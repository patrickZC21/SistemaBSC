import React, { useEffect } from 'react';

const Notificacion = ({ mensaje, tipo = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!mensaje) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        background: tipo === 'error' ? '#f87171' : '#4ade80',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontWeight: 'bold',
      }}
    >
      {mensaje}
    </div>
  );
};

export default Notificacion;
