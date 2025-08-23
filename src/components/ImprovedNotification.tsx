import React, { useEffect, useState } from 'react';
import { Notification as NotificationType, NotificationType as Type } from '@/hooks/useNotification';

interface NotificationProps {
  notification: NotificationType;
  onRemove: (id: string) => void;
}

const getNotificationStyles = (type: Type) => {
  const baseClasses = "mb-3 p-4 rounded-2xl shadow-xl flex items-start gap-3 max-w-sm backdrop-blur-md border transform transition-all duration-500 hover:scale-105";
  
  switch (type) {
    case 'success':
      return `${baseClasses} bg-gradient-to-r from-green-500/90 to-emerald-600/90 border-green-400/50 text-white`;
    case 'error':
      return `${baseClasses} bg-gradient-to-r from-red-500/90 to-pink-600/90 border-red-400/50 text-white`;
    case 'warning':
      return `${baseClasses} bg-gradient-to-r from-amber-500/90 to-orange-600/90 border-amber-400/50 text-white`;
    case 'info':
      return `${baseClasses} bg-gradient-to-r from-blue-500/90 to-indigo-600/90 border-blue-400/50 text-white`;
    default:
      return `${baseClasses} bg-gradient-to-r from-gray-500/90 to-slate-600/90 border-gray-400/50 text-white`;
  }
};

const getIcon = (type: Type) => {
  const iconClasses = "w-5 h-5 flex-shrink-0 mt-0.5";
  
  switch (type) {
    case 'success':
      return (
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'error':
      return (
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'warning':
      return (
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'info':
      return (
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

export const ImprovedNotificationComponent: React.FC<NotificationProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <div 
      className={`
        ${getNotificationStyles(notification.type)}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
      role="alert"
      aria-live="polite"
    >
      {getIcon(notification.type)}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-relaxed">{notification.message}</p>
      </div>
      
      <button
        onClick={handleRemove}
        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent ml-2"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

interface ImprovedNotificationContainerProps {
  notifications: NotificationType[];
  onRemove: (id: string) => void;
}

export const ImprovedNotificationContainer: React.FC<ImprovedNotificationContainerProps> = ({ 
  notifications, 
  onRemove 
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            animationDelay: `${index * 150}ms`
          }}
        >
          <ImprovedNotificationComponent
            notification={notification}
            onRemove={onRemove}
          />
        </div>
      ))}
    </div>
  );
};