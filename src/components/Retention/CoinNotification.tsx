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
          className="fixed top-20 right-4 z-[100] w-80 max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-white border border-amber-200 rounded-lg shadow-lg overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-amber-100">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    <Coins className="h-8 w-8 text-amber-500" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="absolute -top-1 -right-1"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      UTI Coins ganhos!
                    </span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-lg font-bold text-amber-600"
                    >
                      +{amount}
                    </motion.span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {reason}
                  </p>
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Floating coins animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: 20 + i * 10,
                  y: 20
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0.8],
                  x: 20 + i * 10 + Math.random() * 40 - 20,
                  y: [20, -30, -60]
                }}
                transition={{ 
                  delay: 0.5 + i * 0.1, 
                  duration: 2,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                <Coins className="h-4 w-4 text-amber-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

