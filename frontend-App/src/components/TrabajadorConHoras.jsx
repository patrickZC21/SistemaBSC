import React from "react";
const TrabajadorConHoras = ({
  t,
  a,
  h,
  btn,
  observaciones,
  obsEdit,
  editandoHoras,
  horasEdit,
  handleGuardar,
  setEditandoHoras,
  setHorasEdit,
  pad2,
  clamp,
  handleGuardarObs,
  setObsEdit
}) => {
  // Solo activar F si ambas horas son exactamente 00:00
  const noTieneHorasExacto = h && h.ingreso === '00:00' && h.salida === '00:00';
  // Asegurar que tieneHoras esté definido antes de usarlo
  const tieneHoras = h && (h.ingreso !== '00:00' || h.salida !== '00:00');
  // Permitir activar F para cualquier trabajador (sin restricción de horas)
  const [faltaActiva, setFaltaActiva] = React.useState({});
  // Estado para O activo
  const [oActiva, setOActiva] = React.useState({});
  // Ref para textarea de observaciones (evitar scroll al enfocar)
  const obsTextareaRef = React.useRef(null);
  // Determinar si usar estado local o de props para F y O
  const isFActive = faltaActiva[a.trabajador_id];
  const isOActive = oActiva[a.trabajador_id];

  // Activar/desactivar F y O de forma exclusiva
  const handleFClick = () => {
    setFaltaActiva(prev => ({ ...prev, [a.trabajador_id]: !prev[a.trabajador_id] }));
    setOActiva(prev => ({ ...prev, [a.trabajador_id]: false }));
    // Guardar automáticamente 'falta' si no hay observación
    if (!faltaActiva[a.trabajador_id] && (!observaciones[a.trabajador_id] || observaciones[a.trabajador_id].trim() === '')) {
      handleGuardarObs(a.trabajador_id, 'falta');
    }
  };
  const handleOClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const willActivate = !oActiva[a.trabajador_id];
    // Toggle local O state and ensure F is off locally.
    setOActiva(prev => ({ ...prev, [a.trabajador_id]: willActivate }));
    setFaltaActiva(prev => ({ ...prev, [a.trabajador_id]: false }));

    // Si vamos a activar O, intentamos entrar directamente en modo edición.
    if (willActivate) {
      const existing = observaciones[a.trabajador_id];
      if (existing && existing.trim() !== '') {
        // Preferir la ruta del padre que preserva/restaura scroll (startEditObs)
        if (typeof startEditObs === 'function') {
          startEditObs(a.trabajador_id, existing);
        } else {
          // Fallback: escribir en obsEdit (prop) para abrir textarea sin llamar a handler padre
          setObsEdit(prev => ({ ...prev, [a.trabajador_id]: existing }));
        }
      } else {
        // No hay observación previa: preparar campo vacío para edición
        setObsEdit(prev => ({ ...prev, [a.trabajador_id]: '' }));
      }
    }
  };

  React.useEffect(() => {
    // Si F se activa y no hay observación, guardar automáticamente 'falta'
    if (isFActive && (!observaciones[a.trabajador_id] || observaciones[a.trabajador_id].trim() === '')) {
      handleGuardarObs(a.trabajador_id, 'falta');
    }
    // Si F se desactiva y la observación es 'falta', limpiar (opcional, si quieres que se borre al desactivar F)
    // else if (!isFActive && observaciones[a.trabajador_id] === 'falta') {
    //   handleGuardarObs(a.trabajador_id, '');
    // }
  }, [isFActive]);
  
  // NOTA: Se intentionally omitió el focus automático del textarea porque en algunos
  // navegadores móviles provoca un salto del scroll; el usuario deberá tocar para editar.
  return (
    <div key={a.id} className="border border-[#eee] rounded-lg my-4 p-4 bg-[#fafbff]">
      <div className="font-bold text-[22px] text-[#0a194e] mb-0.5">{t.nombre}</div>
      <div className="text-[#555] text-[18px] mb-4">DNI: {t.dni}</div>
      <div className="flex gap-4 justify-start mb-4">
        <div
          className={`flex-1 rounded-2xl py-[18px] text-center font-bold text-[28px] transition-all duration-200 ${
            (tieneHoras || editandoHoras[a.trabajador_id]) ? 'bg-[#0a194e] text-white cursor-default' : 'bg-[#f5f5f5] text-[#222] cursor-pointer'
          }`}
          onClick={() => {
            if (!tieneHoras && !editandoHoras[a.trabajador_id]) {
              setEditandoHoras(e => ({ ...e, [a.trabajador_id]: true }));
              setHorasEdit(e => ({
                ...e,
                [a.trabajador_id]: {
                  hIn: h.ingreso.slice(0,2),
                  mIn: h.ingreso.slice(3,5),
                  hOut: h.salida.slice(0,2),
                  mOut: h.salida.slice(3,5)
                }
              }));
            } else if (editandoHoras[a.trabajador_id]) {
              // Si está editando y las horas siguen en 00:00, ocultar el panel
              const hIn = (horasEdit[a.trabajador_id]?.hIn ?? h.ingreso.slice(0,2));
              const mIn = (horasEdit[a.trabajador_id]?.mIn ?? h.ingreso.slice(3,5));
              const hOut = (horasEdit[a.trabajador_id]?.hOut ?? h.salida.slice(0,2));
              const mOut = (horasEdit[a.trabajador_id]?.mOut ?? h.salida.slice(3,5));
              const esCero = (hIn === '00' && mIn === '00' && hOut === '00' && mOut === '00');
              setEditandoHoras(e => {
                const copy = { ...e };
                delete copy[a.trabajador_id];
                return copy;
              });
              setHorasEdit(e => {
                const copy = { ...e };
                delete copy[a.trabajador_id];
                return copy;
              });
            }
          }}
        >A</div>
        <div
          className={`flex-1 rounded-2xl py-[18px] text-center font-bold text-[28px] transition-all duration-200 cursor-pointer ${
            isFActive ? 'bg-[#0a194e] text-white' : 'bg-[#f5f5f5] text-[#222]'
          }`}
          onClick={e => { e.stopPropagation(); handleFClick(); }}
        >F</div>
        <div
          className={`flex-1 rounded-2xl py-[18px] text-center font-bold text-[28px] transition-all duration-200 cursor-pointer ${
            isOActive ? 'bg-[#0a194e] text-white' : 'bg-[#f5f5f5] text-[#222]'
          }`}
          onClick={() => handleOClick()}
        >O</div>
      </div>
      {/* Panel de horas y observaciones */}
      {(tieneHoras || editandoHoras[a.trabajador_id]) && (
        <div className="bg-white rounded-xl p-6 my-4 border border-[#e5e5e5] flex flex-col items-center">
          <div className="font-semibold text-[20px] text-[#222] mb-2 self-start">hora de ingreso</div>
          <div className="flex gap-2 justify-center mb-4">
            <input
              type={editandoHoras[a.trabajador_id] ? 'number' : 'text'}
              min="0"
              max="23"
              value={editandoHoras[a.trabajador_id] ? (horasEdit[a.trabajador_id]?.hIn || h.ingreso.slice(0,2)) : h.ingreso.slice(0,2)}
              readOnly={!editandoHoras[a.trabajador_id]}
              onClick={() => {
                if (!editandoHoras[a.trabajador_id]) {
                  setEditandoHoras(e => ({ ...e, [a.trabajador_id]: true }));
                  setHorasEdit(e => ({
                    ...e,
                    [a.trabajador_id]: {
                      hIn: h.ingreso.slice(0,2),
                      mIn: h.ingreso.slice(3,5),
                      hOut: h.salida.slice(0,2),
                      mOut: h.salida.slice(3,5)
                    }
                  }));
                }
              }}
              onChange={editandoHoras[a.trabajador_id] ? (e => setHorasEdit(prev => ({ ...prev, [a.trabajador_id]: { ...prev[a.trabajador_id], hIn: pad2(clamp(e.target.value,0,23)) } }))): undefined}
              className={`w-20 h-16 text-[36px] text-center rounded-xl font-medium text-[#3b4252] ${editandoHoras[a.trabajador_id] ? 'border-2 border-[#0a194e] bg-white outline-[#0a194e] cursor-auto' : 'border border-[#ddd] bg-[#f8f8f8] cursor-pointer'}`}
              placeholder="HH"
            />
            <span className="text-[36px] font-medium self-center text-[#3b4252]">:</span>
            <input
              type={editandoHoras[a.trabajador_id] ? 'number' : 'text'}
              min="0"
              max="59"
              value={editandoHoras[a.trabajador_id] ? (horasEdit[a.trabajador_id]?.mIn || h.ingreso.slice(3,5)) : h.ingreso.slice(3,5)}
              readOnly={!editandoHoras[a.trabajador_id]}
              onClick={() => {
                if (!editandoHoras[a.trabajador_id]) {
                  setEditandoHoras(e => ({ ...e, [a.trabajador_id]: true }));
                  setHorasEdit(e => ({
                    ...e,
                    [a.trabajador_id]: {
                      hIn: h.ingreso.slice(0,2),
                      mIn: h.ingreso.slice(3,5),
                      hOut: h.salida.slice(0,2),
                      mOut: h.salida.slice(3,5)
                    }
                  }));
                }
              }}
              onChange={editandoHoras[a.trabajador_id] ? (e => setHorasEdit(prev => ({ ...prev, [a.trabajador_id]: { ...prev[a.trabajador_id], mIn: pad2(clamp(e.target.value,0,59)) } }))): undefined}
              className={`w-20 h-16 text-[36px] text-center rounded-xl font-medium text-[#3b4252] ${editandoHoras[a.trabajador_id] ? 'border-2 border-[#0a194e] bg-white outline-[#0a194e] cursor-auto' : 'border border-[#ddd] bg-[#f8f8f8] cursor-pointer'}`}
              placeholder="MM"
            />
          </div>
          <div className="font-semibold text-[20px] text-[#222] mb-2 self-start">hora de salida</div>
          <div className="flex gap-2 justify-center mb-5">
            <input
              type={editandoHoras[a.trabajador_id] ? 'number' : 'text'}
              min="0"
              max="23"
              value={editandoHoras[a.trabajador_id] ? (horasEdit[a.trabajador_id]?.hOut || h.salida.slice(0,2)) : h.salida.slice(0,2)}
              readOnly={!editandoHoras[a.trabajador_id]}
              onClick={() => {
                if (!editandoHoras[a.trabajador_id]) {
                  setEditandoHoras(e => ({ ...e, [a.trabajador_id]: true }));
                  setHorasEdit(e => ({
                    ...e,
                    [a.trabajador_id]: {
                      hIn: h.ingreso.slice(0,2),
                      mIn: h.ingreso.slice(3,5),
                      hOut: h.salida.slice(0,2),
                      mOut: h.salida.slice(3,5)
                    }
                  }));
                }
              }}
              onChange={editandoHoras[a.trabajador_id] ? (e => setHorasEdit(prev => ({ ...prev, [a.trabajador_id]: { ...prev[a.trabajador_id], hOut: pad2(clamp(e.target.value,0,23)) } }))): undefined}
              className={`w-20 h-16 text-[36px] text-center rounded-xl font-medium text-[#3b4252] ${editandoHoras[a.trabajador_id] ? 'border-2 border-[#0a194e] bg-white outline-[#0a194e] cursor-auto' : 'border border-[#ddd] bg-[#f8f8f8] cursor-pointer'}`}
              placeholder="HH"
            />
            <span className="text-[36px] font-medium self-center text-[#3b4252]">:</span>
            <input
              type={editandoHoras[a.trabajador_id] ? 'number' : 'text'}
              min="0"
              max="59"
              value={editandoHoras[a.trabajador_id] ? (horasEdit[a.trabajador_id]?.mOut || h.salida.slice(3,5)) : h.salida.slice(3,5)}
              readOnly={!editandoHoras[a.trabajador_id]}
              onClick={() => {
                if (!editandoHoras[a.trabajador_id]) {
                  setEditandoHoras(e => ({ ...e, [a.trabajador_id]: true }));
                  setHorasEdit(e => ({
                    ...e,
                    [a.trabajador_id]: {
                      hIn: h.ingreso.slice(0,2),
                      mIn: h.ingreso.slice(3,5),
                      hOut: h.salida.slice(0,2),
                      mOut: h.salida.slice(3,5)
                    }
                  }));
                }
              }}
              onChange={editandoHoras[a.trabajador_id] ? (e => setHorasEdit(prev => ({ ...prev, [a.trabajador_id]: { ...prev[a.trabajador_id], mOut: pad2(clamp(e.target.value,0,59)) } }))): undefined}
              className={`w-20 h-16 text-[36px] text-center rounded-xl font-medium text-[#3b4252] ${editandoHoras[a.trabajador_id] ? 'border-2 border-[#0a194e] bg-white outline-[#0a194e] cursor-auto' : 'border border-[#ddd] bg-[#f8f8f8] cursor-pointer'}`}
              placeholder="MM"
            />
          </div>
          {editandoHoras[a.trabajador_id] ? (
            <button onClick={() => handleGuardar(a.id)} className="block w-full bg-[#0a194e] text-white font-semibold text-[20px] border-none rounded-lg py-[14px] cursor-pointer mt-2 shadow-md">Guardar</button>
          ) : (
            <button className="block w-full bg-[#0a194e] text-white font-semibold text-[20px] border-none rounded-lg py-[14px] cursor-not-allowed mt-2 shadow-md opacity-80" disabled>Guardar</button>
          )}
        </div>
      )}
      {/* Panel de FALTA solo si F está activo */}
      {isFActive && !isOActive && (
        <div className="bg-white rounded-xl p-6 my-4 border border-gray-200 flex flex-col items-center">
          <div className="font-semibold text-[20px] text-gray-800 mb-2 self-start">Falta</div>
          <div
            className="w-full min-h-[52px] bg-gray-100 border-2 border-gray-800 rounded-lg px-2 py-2 text-[22px] text-gray-800 mb-4 select-none pointer-events-none"
          >
            falta
          </div>
          {/* Mostrar botón Guardar solo si la observación no es 'falta' */}
          {observaciones[a.trabajador_id] !== 'falta' && (
            <button
              className="w-full bg-[#0a194e] text-white font-semibold text-[20px] border-none rounded-lg py-3 cursor-pointer mt-2 shadow-md"
              onClick={() => handleGuardarObs(a.trabajador_id, 'falta')}
            >Guardar</button>
          )}
        </div>
      )}
      {/* Observaciones solo si O está activo */}
      {isOActive && !isFActive && (
        <div className="w-full mt-4">
          <div className="font-semibold text-[18px] text-gray-800 mb-2">Agregar observaciones</div>
          {(!obsEdit.hasOwnProperty(a.trabajador_id) && observaciones[a.trabajador_id] && observaciones[a.trabajador_id].trim() !== '') ? (
            <div
              className="w-full min-h-[52px] bg-gray-100 border-2 border-gray-800 rounded-lg px-2 py-2 text-[22px] text-gray-800 mb-2 cursor-pointer whitespace-pre-line"
              onClick={() => startEditObs ? startEditObs(a.trabajador_id, observaciones[a.trabajador_id]) : setObsEdit(prev => ({ ...prev, [a.trabajador_id]: observaciones[a.trabajador_id] }))
              }
              title="Haz clic para editar"
            >
              {observaciones[a.trabajador_id]}
            </div>
          ) : (
            <>
              <textarea
                ref={obsTextareaRef}
                value={obsEdit[a.trabajador_id] !== undefined ? obsEdit[a.trabajador_id] : (observaciones[a.trabajador_id] || '')}
                onChange={e => setObsEdit(prev => ({ ...prev, [a.trabajador_id]: e.target.value }))}
                placeholder="Escribe la observación aquí..."
                rows={2}
                className="w-full border-2 border-gray-800 rounded-lg px-0 py-1 text-[20px] resize-vertical bg-gray-100 text-gray-800 mb-2 min-h-[52px] max-h-[38px] h-[32px] leading-[18px]"
              />
              <button
                onClick={() => handleGuardarObs(a.trabajador_id, obsEdit[a.trabajador_id])}
                disabled={!obsEdit[a.trabajador_id] || obsEdit[a.trabajador_id] === observaciones[a.trabajador_id]}
                className={`w-full bg-[#0a194e] text-white font-semibold text-[17px] border-none rounded-lg py-2 ${(!obsEdit[a.trabajador_id] || obsEdit[a.trabajador_id] === observaciones[a.trabajador_id]) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100'}`}
              >Guardar observación</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TrabajadorConHoras;
