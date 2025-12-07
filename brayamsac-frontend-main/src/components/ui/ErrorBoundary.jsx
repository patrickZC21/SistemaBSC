import React from 'react';

// Error Boundary para capturar errores de React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log del error para debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Enviar error a servicio de logging si está configurado
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // Aquí podrías enviar a un servicio como Sentry, LogRocket, etc.
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Por ahora solo log local, pero se puede enviar a servicio externo
      console.error('Error enviado a servicio:', errorData);
    } catch (logError) {
      console.error('Error al enviar log:', logError);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  ¡Oops! Algo salió mal
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Ocurrió un error inesperado. Por favor, recarga la página o contacta al administrador si el problema persiste.
              </p>
            </div>
            
            {import.meta.env.DEV && (
              <details className="mb-4">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  Detalles técnicos (solo en desarrollo)
                </summary>
                <div className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  <div className="font-semibold text-red-600 mb-1">Error:</div>
                  <div className="mb-2">{this.state.error && this.state.error.toString()}</div>
                  <div className="font-semibold text-red-600 mb-1">Component Stack:</div>
                  <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                </div>
              </details>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Recargar página
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// HOC para envolver componentes con manejo de errores
export const withErrorBoundary = (Component, errorFallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};
