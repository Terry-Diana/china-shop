import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

type NotificationType = 'success' | 'warning' | 'error' | 'info';

interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}

// In a real app, this would be managed by a global state manager like Zustand or Redux
const Notification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info',
  });

  // Mock notification for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification({
        show: true,
        message: 'Special offer: 20% off on all electronics today!',
        type: 'info',
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const icons = {
    success: <CheckCircle size={18} className="text-success-dark" />,
    warning: <AlertTriangle size={18} className="text-warning-dark" />,
    error: <AlertCircle size={18} className="text-error-dark" />,
    info: <AlertCircle size={18} className="text-primary-dark" />,
  };

  const bgColors = {
    success: 'bg-success-50',
    warning: 'bg-warning-50',
    error: 'bg-error-50',
    info: 'bg-primary-50',
  };

  const borderColors = {
    success: 'border-success-light',
    warning: 'border-warning-light',
    error: 'border-error-light',
    info: 'border-primary-light',
  };

  return (
    <AnimatePresence>
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4 py-3 shadow-md rounded-md border ${bgColors[notification.type]} ${borderColors[notification.type]}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">{icons[notification.type]}</span>
              <p className="text-sm font-medium text-gray-800">{notification.message}</p>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 text-gray-400 hover:text-gray-600"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;