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
          className="fixed top-24 right-4 z-[100] w-80 max-w-[calc(100vw-2rem)]"
        >
          <div className={`
            bg-white border rounded-lg shadow-lg overflow-hidden
            ${isCompleted 
              ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
              : 'border-slate-200'
            }
          `}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  ${type === 'badge' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-blue-100 text-blue-600'
                  }
                  ${isCompleted && 'bg-green-100 text-green-600'}
                `}>
                  {icon || (type === 'badge' ? <Award className="h-5 w-5" /> : <Target className="h-5 w-5" />)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">
                      {title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        type === 'badge' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      } ${isCompleted && 'bg-green-100 text-green-700'}`}
                    >
                      {type === 'badge' ? 'Badge' : 'Desafio'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress */}
            <div className="px-4 pb-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Progresso</span>
                  <span className={`font-medium ${
                    isCompleted ? 'text-green-600' : 'text-slate-700'
                  }`}>
                    {progress} / {maxProgress}
                  </span>
                </div>
                
                <Progress 
                  value={progressPercentage} 
                  className={`h-2 ${
                    isCompleted ? 'bg-green-100' : 'bg-slate-100'
                  }`}
                />
                
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-2"
                  >
                    <div className="text-green-600 font-semibold text-sm">
                      🎉 Parabéns! Objetivo concluído!
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

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

          {/* Floating celebration particles for completion */}
          {isCompleted && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: 40 + i * 10,
                    y: 20
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0.8],
                    x: 40 + i * 10 + Math.random() * 60 - 30,
                    y: [20, -40, -80]
                  }}
                  transition={{ 
                    delay: 0.3 + i * 0.1, 
                    duration: 2.5,
                    ease: "easeOut"
                  }}
                  className="absolute text-lg"
                >
                  {['🎉', '⭐', '🏆', '✨', '🎊'][i]}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

