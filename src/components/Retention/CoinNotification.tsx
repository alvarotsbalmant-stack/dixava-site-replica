import React, { useEffect, useState } from 'react';
import { Coins, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CoinNotificationProps {
  amount: number;
  reason: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const CoinNotification: React.FC<CoinNotificationProps> = ({
  amount,
  reason,
  isVisible,
  onClose,
  duration = 4000
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, duration, onClose]);

  useEffect(() => {
    if (isVisible) {
      setProgress(100);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5
          }}
          className="fixed top-20 right-4 z-[100] w-56 max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-white border border-amber-200 rounded-lg shadow-lg overflow-hidden">
            {/* Progress bar */}
            <div className="h-0.5 bg-amber-100">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            <div className="p-1.5">
              <div className="flex items-center gap-1.5">
                {/* Icon with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="absolute -top-0.5 -right-0.5"
                    >
                      <CheckCircle className="h-1.5 w-1.5 text-green-500 bg-white rounded-full" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-700">
                    +{amount} UTI Coins
                  </span>
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-3.5 w-3.5 p-0 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

