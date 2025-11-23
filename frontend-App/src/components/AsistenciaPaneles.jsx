import React, { useState } from "react";
import { updateAsistenciaOptimized } from '../services/asistenciaOptimized.service';
import { usePreventAppClose } from '../hooks/usePreventAppClose';

const AsistenciaPaneles = ({
  showHoraInputs,
  guardado,
  horas,
  setHoras,
  onGuardarA,
  showFaltaInputs,
  fGuardado,
  onGuardarF,
  showObsInputs,
  obsGuardado,
  observaciones,
  setObservaciones,
  onGuardarO,
  trabajadorId,
  asistenciaId,
  onRefreshAsistencias
}) => {
  // Hook para manejar datos guardados/no guardados
  const { markDataAsSaved } = usePreventAppClose();
  const [editandoIngreso, setEditandoIngreso] = useState(false);
  const [editandoSalida, setEditandoSalida] = useState(false);
  const [loadingIngreso, setLoadingIngreso] = useState(false);
  const [loadingSalida, setLoadingSalida] = useState(false);

  // Validación de hora formato HH:mm completo (para validar antes de guardar)
  function isValidHourString(value) {
    return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  // Validación más permisiva para permitir escritura parcial
  function isValidPartialHourString(value) {
    if (!value || value === '') return true;
    // Permite valores parciales como "1", "14", "14:", "14:3", "14:30"
    return /^([01]?\d|2[0-3])?:?([0-5]?\d)?$/.test(value);
  }

  // Función para formatear hora con ceros a la izquierda
  const formatHour = (value) => {
    if (!value || value === '') return '';
    return value.toString().padStart(2, '0');
  };

  // Función para construir hora completa en formato HH:mm
  const buildTimeString = (hours, minutes) => {
    if (!hours && !minutes) return '';
    const h = formatHour(hours);
    const m = formatHour(minutes);
    if (h && m) return `${h}:${m}`;
    return '';
  };

  // Estados locales para los inputs de hora (ahora separados)
  const [horaIngresoH, setHoraIngresoH] = useState(horas?.[trabajadorId]?.ingreso?.split(':')[0] || '');
  const [horaIngresoM, setHoraIngresoM] = useState(horas?.[trabajadorId]?.ingreso?.split(':')[1] || '');
  const [horaSalidaH, setHoraSalidaH] = useState(horas?.[trabajadorId]?.salida?.split(':')[0] || '');
  const [horaSalidaM, setHoraSalidaM] = useState(horas?.[trabajadorId]?.salida?.split(':')[1] || '');

  // Sincronizar el estado local con el global cuando cambie el trabajadorId o las horas
  React.useEffect(() => {
    setHoraIngresoH(horas?.[trabajadorId]?.ingreso?.split(':')[0] || '');
    setHoraIngresoM(horas?.[trabajadorId]?.ingreso?.split(':')[1] || '');
    setHoraSalidaH(horas?.[trabajadorId]?.salida?.split(':')[0] || '');
    setHoraSalidaM(horas?.[trabajadorId]?.salida?.split(':')[1] || '');
    setEditandoIngreso(false);
    setEditandoSalida(false);
  }, [trabajadorId, horas]);

  // Guardar hora de ingreso en BD
  const guardarIngreso = async () => {
    if (!asistenciaId) return;
    const horaIngreso = buildTimeString(horaIngresoH, horaIngresoM);
    if (!isValidHourString(horaIngreso)) {
      alert('Por favor ingresa una hora de ingreso válida (HH:mm)');
      return;
    }
    setLoadingIngreso(true);
    try {
      await updateAsistenciaOptimized(asistenciaId, { hora_entrada: horaIngreso });
      setEditandoIngreso(false);
      // Marcar datos como guardados para prevenir scroll automático
      markDataAsSaved();
    } catch (e) {
      alert('Error al guardar hora de ingreso');
    } finally {
      setLoadingIngreso(false);
    }
  };

  // Guardar hora de salida en BD
  const guardarSalida = async () => {
    if (!asistenciaId) return;
    const horaSalida = buildTimeString(horaSalidaH, horaSalidaM);
    if (!isValidHourString(horaSalida)) {
      alert('Por favor ingresa una hora de salida válida (HH:mm)');
      return;
    }
    setLoadingSalida(true);
    try {
      await updateAsistenciaOptimized(asistenciaId, { hora_salida: horaSalida });
      setEditandoSalida(false);
      // Marcar datos como guardados para prevenir scroll automático
      markDataAsSaved();
    } catch (e) {
      alert('Error al guardar hora de salida');
    } finally {
      setLoadingSalida(false);
    }
  };

  // Guardar ambas horas (ingreso y salida) en BD
  const guardarHoras = async () => {
    if (!asistenciaId) return;

    // Construir las horas completas usando la nueva función
    const horaIngreso = buildTimeString(horaIngresoH, horaIngresoM);
    const horaSalida = buildTimeString(horaSalidaH, horaSalidaM);

    // Si la hora está incompleta o vacía, enviar null
    let ingreso = isValidHourString(horaIngreso) ? horaIngreso : null;
    let salida = isValidHourString(horaSalida) ? horaSalida : null;

    if (!ingreso && !salida) {
      alert('Por favor ingresa al menos una hora válida (HH:mm)');
      return;
    }
    try {
      if (ingreso && salida) {
        await updateAsistenciaOptimized(asistenciaId, { hora_entrada: ingreso, hora_salida: salida });
      } else if (ingreso) {
        await updateAsistenciaOptimized(asistenciaId, { hora_entrada: ingreso });
      } else if (salida) {
        await updateAsistenciaOptimized(asistenciaId, { hora_salida: salida });
      }
      // Marcar datos como guardados para prevenir scroll automático
      markDataAsSaved();
    } catch (e) {
      alert('Error al guardar la(s) hora(s)');
    }
  };

  return (
    <>
      {showHoraInputs && !guardado && !fGuardado && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 16, boxShadow: 'none', border: '1px solid #eee' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>hora de ingreso</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="HH"
                value={horaIngresoH}
                onChange={e => {
                  let h = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setHoraIngresoH(h);
                  const timeString = buildTimeString(h, horaIngresoM);
                  setHoras(prev => ({
                    ...prev,
                    [trabajadorId]: {
                      ingreso: timeString,
                      salida: prev[trabajadorId]?.salida || ''
                    }
                  }));
                }}
                style={{ width: 60, padding: 8, fontSize: 18, borderRadius: 6, border: isValidPartialHourString(horaIngresoH) ? '1px solid #ccc' : '2px solid red', background: '#fff', color: '#222', textAlign: 'center' }}
                maxLength={2}
                min={0}
                max={23}
                autoComplete="off"
              />
              <span style={{ fontSize: 18, alignSelf: 'center' }}>:</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="mm"
                value={horaIngresoM}
                onChange={e => {
                  let m = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setHoraIngresoM(m);
                  const timeString = buildTimeString(horaIngresoH, m);
                  setHoras(prev => ({
                    ...prev,
                    [trabajadorId]: {
                      ingreso: timeString,
                      salida: prev[trabajadorId]?.salida || ''
                    }
                  }));
                }}
                style={{ width: 60, padding: 8, fontSize: 18, borderRadius: 6, border: isValidPartialHourString(horaIngresoM) ? '1px solid #ccc' : '2px solid red', background: '#fff', color: '#222', textAlign: 'center' }}
                maxLength={2}
                min={0}
                max={59}
                autoComplete="off"
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>hora de salida</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="HH"
                value={horaSalidaH}
                onChange={e => {
                  let h = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setHoraSalidaH(h);
                  const timeString = buildTimeString(h, horaSalidaM);
                  setHoras(prev => ({
                    ...prev,
                    [trabajadorId]: {
                      ingreso: prev[trabajadorId]?.ingreso || '',
                      salida: timeString
                    }
                  }));
                }}
                style={{ width: 60, padding: 8, fontSize: 18, borderRadius: 6, border: isValidPartialHourString(horaSalidaH) ? '1px solid #ccc' : '2px solid red', background: '#fff', color: '#222', textAlign: 'center' }}
                maxLength={2}
                min={0}
                max={23}
                autoComplete="off"
              />
              <span style={{ fontSize: 18, alignSelf: 'center' }}>:</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="mm"
                value={horaSalidaM}
                onChange={e => {
                  let m = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setHoraSalidaM(m);
                  const timeString = buildTimeString(horaSalidaH, m);
                  setHoras(prev => ({
                    ...prev,
                    [trabajadorId]: {
                      ingreso: prev[trabajadorId]?.ingreso || '',
                      salida: timeString
                    }
                  }));
                }}
                style={{ width: 60, padding: 8, fontSize: 18, borderRadius: 6, border: isValidPartialHourString(horaSalidaM) ? '1px solid #ccc' : '2px solid red', background: '#fff', color: '#222', textAlign: 'center' }}
                maxLength={2}
                min={0}
                max={59}
                autoComplete="off"
              />
            </div>
          </div>
          <button
            style={{ width: '100%', background: guardado ? '#27ae60' : '#0a194e', color: '#fff', border: 0, borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 20, marginTop: 8, cursor: guardado ? 'default' : 'pointer' }}
            disabled={guardado}
            onClick={guardarHoras}
          >
            {guardado ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      )}
      {showHoraInputs && guardado && !fGuardado && (
        <div style={{ marginTop: 24, background: '#f8fff8', borderRadius: 12, padding: 16, boxShadow: 'none', border: '1px solid #b6e6c9' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>hora de ingreso</label>
            <input
              type="text"
              placeholder="HH:mm"
              value={horaIngresoH + ':' + horaIngresoM}
              disabled={!editandoIngreso && !editandoSalida}
              style={{ width: '100%', padding: 8, fontSize: 18, borderRadius: 6, border: isValidPartialHourString(horaIngresoH + ':' + horaIngresoM) ? '1px solid #ccc' : '2px solid red', marginBottom: 2, background: (editandoIngreso || editandoSalida) ? '#fff' : '#f0f0f0', color: '#222', cursor: 'pointer' }}
              onClick={() => setEditandoIngreso(true)}
              onChange={e => {
                const [h, m] = e.target.value.split(':');
                setHoraIngresoH(h || '');
                setHoraIngresoM(m || '');
                const timeString = buildTimeString(h || '', m || '');
                setHoras(prev => ({
                  ...prev,
                  [trabajadorId]: {
                    ingreso: timeString,
                    salida: prev[trabajadorId]?.salida || ''
                  }
                }));
              }}
              maxLength={5}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>hora de salida</label>
            <input
              type="text"
              placeholder="HH:mm"
              value={horaSalidaH + ':' + horaSalidaM}
              disabled={!editandoSalida && !editandoIngreso}
              style={{ width: '100%', padding: 8, fontSize: 18, borderRadius: 6, border: isValidPartialHourString(horaSalidaH + ':' + horaSalidaM) ? '1px solid #ccc' : '2px solid red', background: (editandoSalida || editandoIngreso) ? '#fff' : '#f0f0f0', color: '#222', cursor: 'pointer', marginBottom: 2 }}
              onClick={() => setEditandoSalida(true)}
              onChange={e => {
                const [h, m] = e.target.value.split(':');
                setHoraSalidaH(h || '');
                setHoraSalidaM(m || '');
                const timeString = buildTimeString(h || '', m || '');
                setHoras(prev => ({
                  ...prev,
                  [trabajadorId]: {
                    ingreso: prev[trabajadorId]?.ingreso || '',
                    salida: timeString
                  }
                }));
              }}
              maxLength={5}
            />
          </div>
          {(editandoIngreso || editandoSalida) && (
            <button
              style={{ width: '100%', background: '#0a194e', color: '#fff', border: 0, borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 20, marginTop: 8, cursor: 'pointer', opacity: loadingIngreso || loadingSalida ? 0.7 : 1 }}
              onClick={async () => {
                setLoadingIngreso(true);
                setLoadingSalida(true);
                await guardarHoras();
                setEditandoIngreso(false);
                setEditandoSalida(false);
                setLoadingIngreso(false);
                setLoadingSalida(false);
              }}
              disabled={loadingIngreso || loadingSalida || (!isValidHourString(buildTimeString(horaIngresoH, horaIngresoM)) && !isValidHourString(buildTimeString(horaSalidaH, horaSalidaM)))}
            >{(loadingIngreso || loadingSalida) ? 'Guardando...' : 'Guardar'}</button>
          )}
          {(!editandoIngreso && !editandoSalida && isValidHourString(buildTimeString(horaIngresoH, horaIngresoM)) && isValidHourString(buildTimeString(horaSalidaH, horaSalidaM))) && (
            <button
              style={{ width: '100%', background: '#27ae60', color: '#fff', border: 0, borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 20, marginTop: 8, cursor: 'default' }}
              disabled
            >Guardado</button>
          )}
        </div>
      )}
      {showFaltaInputs && !fGuardado && !guardado && !obsGuardado && !showHoraInputs && !showObsInputs && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 16, boxShadow: 'none', border: '1px solid #eee' }}>
          <input
            type="text"
            value="Falta"
            disabled
            style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #ccc', background: '#f0f0f0', color: '#222', marginBottom: 16, textAlign: 'center', fontWeight: 700 }}
          />
          <button
            style={{ width: '100%', background: '#0a194e', color: '#fff', border: 0, borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 20, marginTop: 8, cursor: 'pointer' }}
            onClick={onGuardarF}
            disabled={fGuardado}
          >Guardar</button>
        </div>
      )}
      {fGuardado && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 16, boxShadow: 'none', border: '1px solid #eee' }}>
          <input
            type="text"
            value="Falta"
            disabled
            style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #ccc', background: '#f0f0f0', color: '#222', marginBottom: 16, textAlign: 'center', fontWeight: 700 }}
          />
          <button
            style={{ width: '100%', background: '#27ae60', color: '#fff', border: 0, borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 20, marginTop: 8, cursor: 'default' }}
            disabled
          >Guardado</button>
        </div>
      )}
      {obsGuardado && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 16, boxShadow: 'none', border: '1px solid #eee' }}>
          <input
            type="text"
            value={observaciones || ''}
            disabled
            style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #ccc', background: '#f0f0f0', color: '#888', marginBottom: 16 }}
            placeholder="Ingresar observación..."
          />
          <button
            style={{ width: '100%', background: '#27ae60', color: '#fff', border: 0, borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 20, marginTop: 8, cursor: 'default' }}
            disabled
          >Guardado</button>
        </div>
      )}
      {showObsInputs && !obsGuardado && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 16, boxShadow: 'none', border: '1px solid #eee' }}>
          <input
            type="text"
            value={observaciones || ''}
            onChange={e => setObservaciones(o => ({ ...o, [trabajadorId]: e.target.value }))}
            style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #ccc', marginBottom: 16 }}
            placeholder="Ingresar observación..."
          />
          <button
            style={{ width: '100%', background: '#0a194e', color: '#fff', border: 0, borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 20, marginTop: 8, cursor: 'pointer' }}
            onClick={onGuardarO}
          >Guardar</button>
        </div>
      )}
    </>
  );
};

export default AsistenciaPaneles;