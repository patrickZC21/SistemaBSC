import DOMPurify from 'dompurify';

// Sistema de validación robusto
export const validators = {
  // Validaciones básicas
  required: (value, fieldName = 'Campo') => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return `${fieldName} es requerido`;
    }
    return null;
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email debe tener un formato válido';
    }
    return null;
  },
  
  minLength: (value, min, fieldName = 'Campo') => {
    if (String(value).length < min) {
      return `${fieldName} debe tener al menos ${min} caracteres`;
    }
    return null;
  },
  
  maxLength: (value, max, fieldName = 'Campo') => {
    if (String(value).length > max) {
      return `${fieldName} no puede exceder ${max} caracteres`;
    }
    return null;
  },
  
  numeric: (value, fieldName = 'Campo') => {
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return `${fieldName} debe ser un número válido`;
    }
    return null;
  },
  
  dni: (value) => {
    const dniRegex = /^\d{8}$/;
    if (!dniRegex.test(value)) {
      return 'DNI debe tener 8 dígitos';
    }
    return null;
  },
  
  phone: (value) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(value)) {
      return 'Teléfono debe tener un formato válido';
    }
    return null;
  },
  
  timeFormat: (value) => {
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(value)) {
      return 'Hora debe tener formato HH:MM (24 horas)';
    }
    return null;
  },
  
  dateFormat: (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Fecha debe tener un formato válido';
    }
    return null;
  },
  
  password: (value) => {
    const errors = [];
    if (value.length < 8) {
      errors.push('al menos 8 caracteres');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('al menos una letra minúscula');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('al menos una letra mayúscula');
    }
    if (!/\d/.test(value)) {
      errors.push('al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('al menos un carácter especial');
    }
    
    if (errors.length > 0) {
      return `Password debe tener ${errors.join(', ')}`;
    }
    return null;
  }
};

// Sistema de sanitización
export const sanitizers = {
  string: (value) => {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    // Remover espacios al inicio y final
    value = value.trim();
    
    // Sanitizar HTML para prevenir XSS
    value = DOMPurify.sanitize(value, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    return value;
  },
  
  email: (value) => {
    return sanitizers.string(value).toLowerCase();
  },
  
  numeric: (value) => {
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  },
  
  phone: (value) => {
    return String(value).replace(/[^\d+\-\(\)\s]/g, '');
  },
  
  dni: (value) => {
    return String(value).replace(/\D/g, '').slice(0, 8);
  },
  
  time: (value) => {
    // Formato HH:MM
    const cleaned = String(value).replace(/[^\d:]/g, '');
    const parts = cleaned.split(':');
    if (parts.length === 2) {
      const hours = Math.min(23, Math.max(0, parseInt(parts[0]) || 0));
      const minutes = Math.min(59, Math.max(0, parseInt(parts[1]) || 0));
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return cleaned;
  }
};

// Función para validar un objeto completo
export const validateObject = (data, schema) => {
  const errors = {};
  const sanitizedData = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    let value = data[field];
    
    // Aplicar sanitización si está definida
    if (rules.sanitize) {
      value = rules.sanitize(value);
      sanitizedData[field] = value;
    } else {
      sanitizedData[field] = value;
    }
    
    // Aplicar validaciones
    if (rules.validators) {
      for (const validator of rules.validators) {
        const error = validator(value);
        if (error) {
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(error);
        }
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Esquemas de validación predefinidos
export const validationSchemas = {
  trabajador: {
    nombre: {
      sanitize: sanitizers.string,
      validators: [
        (value) => validators.required(value, 'Nombre'),
        (value) => validators.minLength(value, 2, 'Nombre'),
        (value) => validators.maxLength(value, 50, 'Nombre')
      ]
    },
    dni: {
      sanitize: sanitizers.dni,
      validators: [
        (value) => validators.required(value, 'DNI'),
        (value) => validators.dni(value)
      ]
    },
    email: {
      sanitize: sanitizers.email,
      validators: [
        (value) => validators.email(value)
      ]
    }
  },
  
  coordinador: {
    nombre: {
      sanitize: sanitizers.string,
      validators: [
        (value) => validators.required(value, 'Nombre'),
        (value) => validators.minLength(value, 2, 'Nombre'),
        (value) => validators.maxLength(value, 50, 'Nombre')
      ]
    },
    correo: {
      sanitize: sanitizers.email,
      validators: [
        (value) => validators.required(value, 'Correo'),
        (value) => validators.email(value)
      ]
    },
    password: {
      validators: [
        (value) => validators.required(value, 'Contraseña'),
        (value) => validators.password(value)
      ]
    }
  },
  
  asistencia: {
    hora_entrada: {
      sanitize: sanitizers.time,
      validators: [
        (value) => validators.required(value, 'Hora de entrada'),
        (value) => validators.timeFormat(value)
      ]
    },
    hora_salida: {
      sanitize: sanitizers.time,
      validators: [
        (value) => validators.timeFormat(value)
      ]
    },
    justificacion: {
      sanitize: sanitizers.string,
      validators: [
        (value) => validators.maxLength(value, 200, 'Justificación')
      ]
    }
  }
};

// Hook personalizado para validación en formularios React
import { useState, useCallback } from 'react';

export const useFormValidation = (initialData, schema) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validateField = useCallback((field, value) => {
    if (!schema[field]) return null;
    
    const fieldSchema = { [field]: schema[field] };
    const fieldData = { [field]: value };
    const result = validateObject(fieldData, fieldSchema);
    
    return result.errors[field] || null;
  }, [schema]);
  
  const handleChange = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Validar campo si ya fue tocado
    if (touched[field]) {
      const fieldErrors = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors
      }));
    }
  }, [touched, validateField]);
  
  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const value = data[field];
    const fieldErrors = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors
    }));
  }, [data, validateField]);
  
  const validate = useCallback(() => {
    const result = validateObject(data, schema);
    setErrors(result.errors);
    setTouched(Object.keys(schema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));
    
    return result;
  }, [data, schema]);
  
  const reset = useCallback((newData = initialData) => {
    setData(newData);
    setErrors({});
    setTouched({});
  }, [initialData]);
  
  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};
