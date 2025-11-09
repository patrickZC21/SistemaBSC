export const getCoordinadorNombre = (coordinadores, id) => {
  const c = coordinadores.find(c => c.id === Number(id));
  return c ? c.nombre : id;
};

export const getAlmacenNombre = (almacenes, id) => {
  const a = almacenes.find(a => a.id === Number(id));
  return a ? a.nombre : id;
};

export const getSubalmacenNombre = (subalmacenes, id) => {
  const s = subalmacenes.find(s => s.id === Number(id));
  return s ? s.nombre : id;
};