import React from "react";

const AsistenciaButtons = ({
  guardado,
  fGuardado,
  obsGuardado,
  showHoraInputs,
  showFaltaInputs,
  showObsInputs,
  onA,
  onF,
  onO,
  trabajadorId
}) => (
  <div style={{ display: 'flex', gap: 16, marginTop: 18, justifyContent: 'center' }}>
    <button
      style={{
        flex: 1,
        border: 0,
        borderRadius: 20,
        padding: '18px 0',
        background: guardado && !fGuardado ? '#27ae60' : (showHoraInputs && !fGuardado ? '#27ae60' : '#f4f4f4'),
        fontWeight: 900,
        fontSize: 38,
        color: guardado && !fGuardado ? '#fff' : (showHoraInputs && !fGuardado ? '#fff' : '#222'),
        minWidth: 0,
        boxShadow: 'none',
        transition: 'none',
        outline: 'none',
        cursor: (guardado || fGuardado) ? 'default' : 'pointer',
        opacity: fGuardado ? 0.5 : 1
      }}
      onClick={onA}
      disabled={guardado || obsGuardado || fGuardado || showHoraInputs} // Deshabilitar si ya está en modo hora
    >A</button>
    <button
      style={{
        flex: 1,
        border: 0,
        borderRadius: 20,
        padding: '18px 0',
        background:
          fGuardado
            ? '#e74c3c'
            : showFaltaInputs
            ? '#e74c3c'
            : (guardado || obsGuardado || showHoraInputs)
            ? '#f4f4f4'
            : '#f4f4f4',
        fontWeight: 900,
        fontSize: 38,
        color:
          fGuardado || showFaltaInputs
            ? '#fff'
            : '#222',
        minWidth: 0,
        boxShadow: 'none',
        transition: 'none',
        outline: 'none',
        cursor: (fGuardado || guardado || obsGuardado || showHoraInputs) ? 'not-allowed' : 'pointer',
        opacity: (fGuardado || guardado || obsGuardado || showHoraInputs) ? 0.5 : 1
      }}
      onClick={onF}
      disabled={fGuardado || guardado || obsGuardado || showHoraInputs} // Deshabilitar si ya tiene horas
    >F</button>
    <button
      style={{
        flex: 1,
        border: 0,
        borderRadius: 20,
        padding: '18px 0',
        background: obsGuardado && !fGuardado ? '#27ae60' : (showObsInputs && !fGuardado ? '#0a194e' : '#f4f4f4'),
        fontWeight: 900,
        fontSize: 38,
        color: obsGuardado && !fGuardado ? '#fff' : (showObsInputs && !fGuardado ? '#fff' : '#222'),
        minWidth: 0,
        boxShadow: 'none',
        transition: 'none',
        outline: 'none',
        cursor: (obsGuardado || fGuardado) ? 'not-allowed' : 'pointer',
        opacity: (obsGuardado || fGuardado) ? 0.5 : 1
      }}
      onClick={onO}
      disabled={obsGuardado || fGuardado}
    >O</button>
  </div>
);

export default AsistenciaButtons;
