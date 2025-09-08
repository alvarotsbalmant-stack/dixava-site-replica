import { useState, useCallback } from 'react';

interface ScrollCoinsNotificationState {
  isVisible: boolean;
  amount: number;
}

export const useScrollCoinsNotification = () => {
  const [notification, setNotification] = useState<ScrollCoinsNotificationState>({
    isVisible: false,
    amount: 0
  });

  const showNotification = useCallback((amount: number) => {
    setNotification({
      isVisible: true,
      amount
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
};

