export const statusLabels = {
  A: 'Asistencia',
  F: 'Falta',
  O: 'Observaciones',
  B: 'Baja',
};

export const getStatusLetter = (estado) => {
  if (['A', 'F', 'O', 'B'].includes(estado)) return estado;
  return '';
};
