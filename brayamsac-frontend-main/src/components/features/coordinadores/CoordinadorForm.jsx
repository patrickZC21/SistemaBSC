import React from 'react';

import CoordinadorForm from '../../components/Coordinadores/CoordinadorForm';

const CoordinadorPage = () => {
  const [formData, setFormData] = React.useState({
    nombre: '',
    correo: '',
    password: '',
    almacen_id: '',
    subalmacen_id: ''
  });

  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Submit logic here
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Registrar Coordinador</h1>
      <CoordinadorForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default CoordinadorPage;