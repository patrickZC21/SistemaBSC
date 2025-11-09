import React from 'react';

const SubAlmacenHeader = ({ nombreAlmacen }) => (
  <div>
    <span className="text-gray-500">Almacenes / {nombreAlmacen}</span>
    <h1 className="text-2xl font-bold mt-2">Almacenes de brayam sac</h1>
  </div>
);

export default SubAlmacenHeader;