import React from 'react';
import { Challenge } from '@/types/retention';
import { useChallenges } from '@/hooks/useChallenges';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Clock, Gift, Coins, Percent, Award } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  index?: number;
  onClaim?: (challengeId: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  index = 0,
  onClaim 
}) => {
  const { 
    getProgressPercentage, 
    getTimeRemaining, 
    getTypeColor, 
    getTypeIcon,
    isCompleted,
    canClaim
  } = useChallenges();
  
  const progressPercentage = getProgressPercentage(challenge);
  const timeRemaining = getTimeRemaining(challenge);
  const completed = isCompleted(challenge);
  const claimable = canClaim(challenge);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`
        relative p-5 rounded-xl border transition-all duration-300 hover:shadow-lg
        ${completed 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
          : 'bg-white border-slate-200 hover:border-slate-300'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center text-xl
            ${getTypeColor(challenge.type)}
          `}>
            {getTypeIcon(challenge.type)}
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">
              {challenge.title}
            </h3>
            <Badge variant="outline" className={`text-xs ${getTypeColor(challenge.type)}`}>
              {challenge.type === 'daily' && 'Diário'}
              {challenge.type === 'weekly' && 'Semanal'}
              {challenge.type === 'monthly' && 'Mensal'}
              {challenge.type === 'special' && 'Especial'}
            </Badge>
          </div>
        </div>

        {/* Time remaining */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </div>
          {completed && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              Completo!
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        {challenge.description}
      </p>

      {/* Progress */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-slate-700">Progresso</span>
          <span className="text-xs text-slate-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
        
        {/* Requirements */}
        <div className="space-y-1">
          {challenge.requirements.map((req, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-slate-600">
                {req.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`font-medium ${
                (req.current || 0) >= req.target ? 'text-green-600' : 'text-slate-500'
              }`}>
                {req.current || 0} / {req.target}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-slate-700 mb-2">Recompensas</div>
        <div className="flex flex-wrap gap-2">
          {challenge.reward.coins && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs">
              <Coins className="h-3 w-3" />
              {challenge.reward.coins} coins
            </div>
          )}
          
          {challenge.reward.badge && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
              <Award className="h-3 w-3" />
              {challenge.reward.badge}
            </div>
          )}
          
          {challenge.reward.discount && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
              <Percent className="h-3 w-3" />
              {challenge.reward.discount}% desconto
            </div>
          )}
        </div>

        {/* Claim button */}
        {claimable && onClaim && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              onClick={() => onClaim(challenge.id)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              size="sm"
            >
              <Gift className="h-4 w-4 mr-2" />
              Resgatar Recompensa
            </Button>
          </motion.div>
        )}
      </div>

      {/* Completion glow effect */}
      {completed && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20"
          animate={{ 
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

