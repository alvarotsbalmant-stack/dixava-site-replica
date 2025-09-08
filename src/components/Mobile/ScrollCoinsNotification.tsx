import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScrollCoinsNotificationProps {
  amount: number;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const ScrollCoinsNotification: React.FC<ScrollCoinsNotificationProps> = ({
  amount,
  isVisible,
  onClose,
  duration = 2500
}) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  // Só renderiza no mobile
  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            duration: 0.3
          }}
          className="fixed top-[74px] right-4 z-[85] pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 1] }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-md"
            style={{
              width: 'auto',
              maxWidth: '120px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="text-white font-medium text-[10px] tracking-wide whitespace-nowrap">
              Exploração! +{amount}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

