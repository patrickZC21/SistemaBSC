import React from 'react';

/**
 * Componente para mostrar mensajes de error y éxito de manera más amigable
 */
export default function NotificationMessage({ type, message, onClose, showIcon = true }) {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: '❌'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: '⚠️'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: '✅'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'ℹ️'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: '💡'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-md p-3 mt-2 relative`}>
      <div className="flex items-start">
        {showIcon && (
          <span className="mr-2 text-sm">
            {styles.icon}
          </span>
        )}
        <div className="flex-1">
          <p className={`text-xs ${styles.text} leading-relaxed`}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-2 ${styles.text} hover:opacity-70 font-bold text-sm`}
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
