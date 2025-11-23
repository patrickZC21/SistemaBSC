import { useState } from "react";

export function useAsistenciaEstados() {
  const [showHoraInputs, setShowHoraInputs] = useState({});
  const [horas, setHoras] = useState({});
  const [guardado, setGuardado] = useState({});
  const [showObsInputs, setShowObsInputs] = useState({});
  const [observaciones, setObservaciones] = useState({});
  const [obsGuardado, setObsGuardado] = useState({});
  const [fGuardado, setFGuardado] = useState({});
  const [showFaltaInputs, setShowFaltaInputs] = useState({});

  return {
    showHoraInputs, setShowHoraInputs,
    horas, setHoras,
    guardado, setGuardado,
    showObsInputs, setShowObsInputs,
    observaciones, setObservaciones,
    obsGuardado, setObsGuardado,
    fGuardado, setFGuardado,
    showFaltaInputs, setShowFaltaInputs
  };
}
