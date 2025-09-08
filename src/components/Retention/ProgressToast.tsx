import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Award, Target } from 'lucide-react';

interface ProgressToastProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'badge' | 'challenge';
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  icon?: string;
}

export const ProgressToast: React.FC<ProgressToastProps> = ({
  isVisible,
  onClose,
  type,
  title,
  description,
  progress,
  maxProgress,
  icon
}) => {
  const progressPercentage = (progress / maxProgress) * 100;
  const isCompleted = progress >= maxProgress;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5
          }}
          className="fixed top-24 right-4 z-[100] w-56 max-w-[calc(100vw-2rem)]"
        >
          <div className={`
            bg-white border rounded-lg shadow-lg overflow-hidden
            ${isCompleted 
              ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
              : 'border-slate-200'
            }
          `}>
            {/* Header */}
            <div className="flex items-center justify-between p-1.5">
              <div className="flex items-center gap-1">
                <div className={`
                  w-3.5 h-3.5 rounded-full flex items-center justify-center
                  ${type === 'badge' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-blue-100 text-blue-600'
                  }
                  ${isCompleted && 'bg-green-100 text-green-600'}
                `}>
                  {icon || (type === 'badge' ? <Award className="h-2 w-2" /> : <Target className="h-2 w-2" />)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium text-xs text-slate-800 truncate">
                      {title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-1 py-0 h-3 ${
                        type === 'badge' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      } ${isCompleted && 'bg-green-100 text-green-700'}`}
                    >
                      {isCompleted ? '✓' : `${progress}/${maxProgress}`}
                    </Badge>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </div>

            {/* Progress bar only if not completed */}
            {!isCompleted && (
              <div className="px-1.5 pb-1">
                <Progress 
                  value={progressPercentage} 
                  className="h-0.5 bg-slate-100"
                />
              </div>
            )}

            {/* Completion glow effect */}
            {isCompleted && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-400/10 to-green-400/10"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

