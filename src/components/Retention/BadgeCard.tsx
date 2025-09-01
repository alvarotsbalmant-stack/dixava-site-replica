import React from 'react';
import { UserBadge } from '@/types/retention';
import { useBadges } from '@/hooks/useBadges';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';

interface BadgeCardProps {
  badge: UserBadge;
  index?: number;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, index = 0 }) => {
  const { getProgressPercentage, getRarityGradient } = useBadges();
  
  const isUnlocked = !!badge.unlockedAt;
  const progressPercentage = getProgressPercentage(badge);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`
        relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg
        ${isUnlocked 
          ? 'bg-white border-slate-200 hover:border-slate-300' 
          : 'bg-slate-50 border-slate-100 hover:border-slate-200'
        }
      `}
    >
      {/* Rarity Indicator */}
      <div className={`absolute top-2 right-2`}>
        <Badge 
          variant="secondary"
          className={`text-xs px-2 py-1 bg-gradient-to-r ${getRarityGradient(badge.rarity)} text-white border-0`}
        >
          {badge.rarity}
        </Badge>
      </div>

      {/* Badge Icon */}
      <div className="flex items-center justify-center mb-3">
        <div className={`
          relative w-16 h-16 rounded-full flex items-center justify-center text-2xl
          ${isUnlocked 
            ? `bg-gradient-to-br ${getRarityGradient(badge.rarity)} text-white shadow-lg` 
            : 'bg-slate-200 text-slate-400'
          }
        `}>
          {isUnlocked ? (
            <>
              <span>{badge.icon}</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="absolute -bottom-1 -right-1"
              >
                <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
              </motion.div>
            </>
          ) : (
            <Lock className="h-6 w-6" />
          )}
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center space-y-2">
        <h3 className={`font-semibold text-sm ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
          {badge.name}
        </h3>
        
        <p className={`text-xs leading-relaxed ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
          {badge.description}
        </p>

        {/* Progress for locked badges */}
        {!isUnlocked && badge.maxProgress && (
          <div className="space-y-2 mt-3">
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-slate-500">
              {badge.progress || 0} / {badge.maxProgress}
            </div>
          </div>
        )}

        {/* Unlock date for unlocked badges */}
        {isUnlocked && badge.unlockedAt && (
          <div className="text-xs text-slate-500 mt-2">
            Desbloqueado em {new Date(badge.unlockedAt).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>

      {/* Shine effect for unlocked badges */}
      {isUnlocked && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
          animate={{ 
            opacity: [0, 0.3, 0],
            x: [-100, 100]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        />
      )}
    </motion.div>
  );
};

