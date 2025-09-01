import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NotificationData {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

interface RetentionContextType {
  notifications: NotificationData[];
  showCoinNotification: (amount: number, reason: string) => void;
  dismissNotification: (id: string) => void;
}

const RetentionContext = createContext<RetentionContextType | undefined>(undefined);

interface RetentionProviderProps {
  children: ReactNode;
}

export const RetentionProvider: React.FC<RetentionProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showCoinNotification = useCallback((amount: number, reason: string) => {
    const id = Date.now().toString();
    const newNotification: NotificationData = {
      id,
      amount,
      reason,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value: RetentionContextType = {
    notifications,
    showCoinNotification,
    dismissNotification
  };

  return (
    <RetentionContext.Provider value={value}>
      {children}
    </RetentionContext.Provider>
  );
};

export const useRetention = (): RetentionContextType => {
  const context = useContext(RetentionContext);
  if (context === undefined) {
    throw new Error('useRetention must be used within a RetentionProvider');
  }
  return context;
};

