import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Star,
  Heart,
  Zap,
  Shield,
  Crown
} from 'lucide-react';

// Floating Particles Animation
export const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    duration: 3 + (i * 0.5),
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-10, -30, -10],
            x: [-5, 5, -5],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Success Celebration Animation
export const SuccessCelebration: React.FC = () => {
  const icons = [Sparkles, Star, Heart, Zap];
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {icons.map((Icon, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: `${20 + (index * 20)}%`,
            top: `${30 + (index % 2) * 40}%`,
          }}
          initial={{ 
            scale: 0, 
            rotate: -180, 
            opacity: 0 
          }}
          animate={{ 
            scale: [0, 1.2, 0.8, 1], 
            rotate: [0, 180, 360], 
            opacity: [0, 1, 1, 0],
            y: [0, -20, -40]
          }}
          transition={{
            duration: 2,
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <Icon className="w-6 h-6 text-amber-400" />
        </motion.div>
      ))}
    </div>
  );
};

// Typing Animation for Text
interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TypingText: React.FC<TypingTextProps> = ({ 
  text, 
  className = "", 
  delay = 0 
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + (index * 0.05),
            duration: 0.3
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Pulse Animation for Icons
interface PulsingIconProps {
  icon: React.ReactNode;
  className?: string;
  pulseColor?: string;
}

export const PulsingIcon: React.FC<PulsingIconProps> = ({ 
  icon, 
  className = "",
  pulseColor = "bg-amber-400"
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Pulse rings */}
      <motion.div
        className={`absolute inset-0 rounded-full ${pulseColor} opacity-20`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={`absolute inset-0 rounded-full ${pulseColor} opacity-10`}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.1, 0, 0.1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5,
          ease: "easeInOut"
        }}
      />
      
      {/* Main icon */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {icon}
      </motion.div>
    </div>
  );
};

// Loading Dots Animation
export const LoadingDots: React.FC = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Slide In Animation Container
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction = 'up',
  delay = 0,
  className = ""
}) => {
  const directionMap = {
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    up: { x: 0, y: 30 },
    down: { x: 0, y: -30 }
  };

  const initial = directionMap[direction];

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...initial 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Scale In Animation
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  delay = 0,
  className = ""
}) => {
  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        scale: 0.8 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1 
      }}
      transition={{
        duration: 0.4,
        delay,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
};

// Stagger Animation Container
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({ 
  children, 
  staggerDelay = 0.1,
  className = ""
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Stagger Item
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ 
  children, 
  className = ""
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { 
          opacity: 0, 
          y: 20 
        },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut"
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Hover Scale Animation
interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export const HoverScale: React.FC<HoverScaleProps> = ({ 
  children, 
  scale = 1.05,
  className = ""
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        scale,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Shake Animation (for errors)
interface ShakeProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

export const Shake: React.FC<ShakeProps> = ({ 
  children, 
  trigger,
  className = ""
}) => {
  return (
    <motion.div
      className={className}
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      } : {}}
    >
      {children}
    </motion.div>
  );
};

// Progress Bar Animation
interface ProgressBarProps {
  progress: number;
  className?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className = "",
  color = "bg-amber-400"
}) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <motion.div
        className={`h-2 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          duration: 0.5,
          ease: "easeOut"
        }}
      />
    </div>
  );
};

// Morphing Icon Animation
interface MorphingIconProps {
  icons: React.ReactNode[];
  currentIndex: number;
  className?: string;
}

export const MorphingIcon: React.FC<MorphingIconProps> = ({ 
  icons, 
  currentIndex,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ 
            scale: 0, 
            rotate: -180,
            opacity: 0 
          }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            opacity: 1 
          }}
          exit={{ 
            scale: 0, 
            rotate: 180,
            opacity: 0 
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          {icons[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Glow Effect
interface GlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  className?: string;
}

export const Glow: React.FC<GlowProps> = ({ 
  children, 
  color = "amber",
  intensity = 20,
  className = ""
}) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{
        filter: `drop-shadow(0 0 ${intensity}px rgb(245 158 11 / 0.5))`
      }}
    >
      {children}
    </div>
  );
};

