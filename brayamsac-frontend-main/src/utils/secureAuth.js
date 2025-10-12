// Almacenamiento seguro de tokens con httpOnly cookies como alternativa
class SecureTokenManager {
  constructor() {
    this.storage = this.getSecureStorage();
    this.listeners = new Set();
  }
  
  getSecureStorage() {
    // Preferir sessionStorage sobre localStorage para mayor seguridad
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return sessionStorage;
    } catch {
      console.warn('SessionStorage no disponible, usando localStorage');
      return localStorage;
    }
  }
  
  set(token, refreshToken = null) {
    try {
      if (!token) {
        throw new Error('Token es requerido');
      }
      
      // Validar formato JWT básico
      if (!this.isValidJWTFormat(token)) {
        throw new Error('Formato de token inválido');
      }
      
      const tokenData = {
        token,
        refreshToken,
        timestamp: Date.now(),
        expiresAt: this.getTokenExpiry(token)
      };
      
      this.storage.setItem('auth_data', JSON.stringify(tokenData));
      this.notifyListeners('token_set', { token });
      return true;
    } catch (error) {
      console.error('Error almacenando token:', error);
      return false;
    }
  }
  
  get() {
    try {
      const data = this.storage.getItem('auth_data');
      if (!data) return null;
      
      const tokenData = JSON.parse(data);
      
      // Verificar expiración
      if (this.isTokenExpired(tokenData)) {
        this.clear();
        return null;
      }
      
      return tokenData.token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      this.clear();
      return null;
    }
  }
  
  getRefreshToken() {
    try {
      const data = this.storage.getItem('auth_data');
      if (!data) return null;
      
      const tokenData = JSON.parse(data);
      return tokenData.refreshToken || null;
    } catch {
      return null;
    }
  }
  
  clear() {
    try {
      this.storage.removeItem('auth_data');
      this.notifyListeners('token_cleared');
      return true;
    } catch (error) {
      console.error('Error limpiando tokens:', error);
      return false;
    }
  }
  
  isValid() {
    const token = this.get();
    return token !== null;
  }
  
  isValidJWTFormat(token) {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }
  
  getTokenExpiry(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : Date.now() + 3600000; // 1 hora por defecto
    } catch {
      return Date.now() + 3600000; // 1 hora por defecto
    }
  }
  
  isTokenExpired(tokenData) {
    const now = Date.now();
    const margin = 60000; // 1 minuto de margen
    return tokenData.expiresAt && (tokenData.expiresAt - margin) <= now;
  }
  
  // Sistema de listeners para cambios de token
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error en listener de token:', error);
      }
    });
  }
  
  // Renovación automática de token
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Error renovando token');
      }
      
      const data = await response.json();
      this.set(data.token, data.refreshToken);
      
      return data.token;
    } catch (error) {
      this.clear();
      throw error;
    }
  }
}

export const secureTokenManager = new SecureTokenManager();

// Hook para usar el token manager en componentes React
import { useState, useEffect } from 'react';

export const useSecureAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(secureTokenManager.isValid());
  const [token, setToken] = useState(secureTokenManager.get());
  
  useEffect(() => {
    const removeListener = secureTokenManager.addListener((event) => {
      if (event === 'token_set') {
        setIsAuthenticated(true);
        setToken(secureTokenManager.get());
      } else if (event === 'token_cleared') {
        setIsAuthenticated(false);
        setToken(null);
      }
    });
    
    return removeListener;
  }, []);
  
  const login = async (credentials) => {
    // Implementar login con manejo seguro
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }
      
      const data = await response.json();
      secureTokenManager.set(data.token, data.refreshToken);
      
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      const currentToken = secureTokenManager.get();
      if (currentToken) {
        // Notificar al backend sobre el logout
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      secureTokenManager.clear();
    }
  };
  
  return {
    isAuthenticated,
    token,
    login,
    logout,
    refreshToken: () => secureTokenManager.refreshToken()
  };
};
