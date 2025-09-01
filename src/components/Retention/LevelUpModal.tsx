import React from 'react';
import { UserLevel } from '@/types/retention';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Star, Gift, X, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: UserLevel;
  previousLevel: UserLevel;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  previousLevel
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.6
            }}
            className="fixed inset-0 flex items-center justify-center z-[201] p-4"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-blue-300/30 rounded-full blur-2xl" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="relative z-10 p-8 text-center">
                {/* Celebration icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  className="mb-6"
                >
                  <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Crown className="h-10 w-10 text-white" />
                    
                    {/* Sparkles around the crown */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${50 + 40 * Math.cos((i * 60) * Math.PI / 180)}%`,
                          top: `${50 + 40 * Math.sin((i * 60) * Math.PI / 180)}%`,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ 
                          delay: 0.5 + i * 0.1,
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Sparkles className="h-4 w-4 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    🎉 Parabéns!
                  </h2>
                  <p className="text-slate-600">
                    Você subiu de nível!
                  </p>
                </motion.div>

                {/* Level transition */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-center gap-4">
                    {/* Previous level */}
                    <div className="text-center">
                      <Badge 
                        variant="secondary"
                        className="mb-2 px-3 py-1"
                        style={{ 
                          backgroundColor: previousLevel.color + '20', 
                          color: previousLevel.color 
                        }}
                      >
                        <span className="mr-1">{previousLevel.icon}</span>
                        {previousLevel.name}
                      </Badge>
                    </div>

                    {/* Arrow */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="text-2xl">→</div>
                    </motion.div>

                    {/* New level */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                      className="text-center"
                    >
                      <Badge 
                        variant="secondary"
                        className="mb-2 px-3 py-1 shadow-lg"
                        style={{ 
                          backgroundColor: newLevel.color + '20', 
                          color: newLevel.color,
                          border: `2px solid ${newLevel.color}40`
                        }}
                      >
                        <span className="mr-1">{newLevel.icon}</span>
                        {newLevel.name}
                      </Badge>
                    </motion.div>
                  </div>
                </motion.div>

                {/* New benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Gift className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-700">
                        Novos Benefícios Desbloqueados
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {newLevel.benefits.slice(0, 3).map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
                          {benefit}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="flex gap-3"
                >
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                  <Button
                    onClick={() => {
                      onClose();
                      window.location.href = '/coins';
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    Ver Detalhes
                  </Button>
                </motion.div>
              </div>

              {/* Floating celebration elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-lg"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      y: 50
                    }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      y: [50, -100, -200],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      delay: 0.5 + i * 0.1, 
                      duration: 3,
                      ease: "easeOut"
                    }}
                  >
                    {['🎉', '⭐', '🏆', '✨', '🎊', '💎'][i % 6]}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

