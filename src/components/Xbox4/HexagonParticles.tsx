
import React from 'react';
import { motion } from 'framer-motion';

const HexagonParticles = () => {
  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 opacity-20"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0c-0.89 0-1.78.05-2.67.16L0.94 8.78c-1.21.61-1.94 1.85-1.94 3.2v17.24c0 1.35.73 2.59 1.94 3.2l11.39 6.62c1.21.61 2.67.61 3.88 0l11.39-6.62c1.21-.61 1.94-1.85 1.94-3.2V11.98c0-1.35-.73-2.59-1.94-3.2L17.67.16C16.78.05 15.89 0 15 0z' fill='%23FFFFFF' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }}
          initial={{
            scale: 0,
            rotate: 0,
            y: 0,
          }}
          animate={{
            scale: [0, 1, 0.8],
            rotate: [0, 90, 180],
            y: [0, -100, -200],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default HexagonParticles;
