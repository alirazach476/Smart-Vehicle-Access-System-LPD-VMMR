import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CloudRain, Info } from 'lucide-react';

interface Toast {
  id: string;
  type: 'unauthorized' | 'weather' | 'system';
  message: string;
}

interface NotificationContextType {
  showNotification: (type: Toast['type'], message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showNotification = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'unauthorized':
        return <AlertTriangle className="w-5 h-5" />;
      case 'weather':
        return <CloudRain className="w-5 h-5" />;
      case 'system':
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: Toast['type']) => {
    switch (type) {
      case 'unauthorized':
        return 'bg-red-500/90 text-white';
      case 'weather':
        return 'bg-orange-500/90 text-white';
      case 'system':
        return 'bg-blue-500/90 text-white';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`${getStyles(toast.type)} rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-sm`}
            >
              {getIcon(toast.type)}
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
