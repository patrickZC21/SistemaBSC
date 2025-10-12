// Configuración de entorno segura
export const config = {
  // URLs dinámicas basadas en entorno
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000,
  
  // Configuración de autenticación
  AUTH: {
    TOKEN_KEY: 'app_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    TOKEN_EXPIRY_MARGIN: 60000, // 1 minuto antes de expirar
  },
  
  // Configuración de seguridad
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 300000, // 5 minutos
    PASSWORD_MIN_LENGTH: 8,
    SESSION_TIMEOUT: 3600000, // 1 hora
  },
  
  // Configuración de UI
  UI: {
    DEBOUNCE_DELAY: 300,
    PAGINATION_SIZE: 20,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  }
};

// Validador de configuración
export const validateConfig = () => {
  const requiredVars = ['VITE_API_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Variables de entorno faltantes:', missing);
  }
  
  return missing.length === 0;
};
