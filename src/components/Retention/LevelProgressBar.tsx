import React from 'react';
import { useUserLevel } from '@/hooks/useUserLevel';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface LevelProgressBarProps {
  showDetails?: boolean;
  className?: string;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  showDetails = true,
  className = ''
}) => {
  const { currentLevel, nextLevel, progressToNextLevel, coinsToNextLevel } = useUserLevel();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Level Badge */}
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary"
          className="text-sm font-medium px-3 py-1"
          style={{ 
            backgroundColor: currentLevel.color + '20', 
            color: currentLevel.color,
            border: `1px solid ${currentLevel.color}40`
          }}
        >
          <span className="mr-2">{currentLevel.icon}</span>
          {currentLevel.name}
        </Badge>
        
        {nextLevel && showDetails && (
          <div className="text-right">
            <div className="text-sm font-medium text-slate-700">
              {Math.round(progressToNextLevel)}%
            </div>
            <div className="text-xs text-slate-500">
              para {nextLevel.name}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {nextLevel && (
        <div className="space-y-2">
          <div className="relative">
            <Progress 
              value={progressToNextLevel} 
              className="h-3 bg-slate-100"
            />
            <motion.div
              className="absolute inset-0 h-3 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </motion.div>
          </div>
          
          {showDetails && (
            <div className="flex justify-between text-xs text-slate-600">
              <span>{currentLevel.name}</span>
              <span className="font-medium">
                {coinsToNextLevel.toLocaleString()} coins restantes
              </span>
              <span>{nextLevel.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Benefits Preview */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs font-medium text-slate-700 mb-2">
              Benefícios atuais
            </div>
            <div className="space-y-1">
              {currentLevel.benefits.slice(0, 2).map((benefit, index) => (
                <div key={index} className="text-xs text-slate-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
          
          {nextLevel && (
            <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <div className="text-xs font-medium text-slate-700 mb-2">
                Próximos benefícios
              </div>
              <div className="space-y-1">
                {nextLevel.benefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="text-xs text-slate-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

