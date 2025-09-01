import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavigationItem as NavigationItemType } from '@/types/navigation';

interface NavigationItemProps {
  item: NavigationItemType;
  className?: string;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ item, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (item.link_type === 'external') {
      e.preventDefault();
      window.open(item.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Cores padrão se não especificadas
  const normalText = '#333333';

  const ItemContent = () => (
    <motion.div
      ref={containerRef}
      className="relative inline-block cursor-pointer select-none text-sm md:text-base font-normal px-4 py-3 nav-item-poppins" // Adicionada classe nav-item-poppins
      style={{
        color: normalText,
        fontFamily: 'Poppins, sans-serif', // Removido !important
      }}
      onClick={handleClick}
      initial="initial"
      whileHover="hover"
      variants={{
        initial: {
          y: 0,
          scale: 1,
          paddingLeft: window.innerWidth >= 768 ? '12px' : '10px', // Aumentado para acomodar ícones maiores
          paddingRight: window.innerWidth >= 768 ? '12px' : '10px',
        },
        hover: {
          y: -2,
          scale: 1.02,
          paddingLeft: window.innerWidth >= 1024 ? '56px' : '48px', // Aumentado ainda mais para dar mais liberdade ao ícone
          paddingRight: window.innerWidth >= 1024 ? '20px' : '16px',
        }
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      {/* Sombra no hover */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 }
        }}
        transition={{ 
          duration: 0.25,
          ease: "easeInOut"
        }}
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
          zIndex: -1,
        }}
      />

      {/* Linha animada no hover */}
      <motion.div
        className="absolute bottom-0 left-1/2 h-0.5 rounded-full"
        style={{
          backgroundColor: item.background_color || '#3b82f6',
        }}
        variants={{
          initial: { 
            width: 0, 
            x: '-50%',
            opacity: 0 
          },
          hover: {
            width: '80%',
            opacity: 1,
          }
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
      />

      {/* Ícone animado no hover */}
      {item.icon_url && (
        <motion.span 
          className="text-2xl absolute left-3 top-1/2 pointer-events-none select-none"
          style={{
            transformOrigin: 'center center',
          }}
          variants={{
            initial: {
              rotate: -45,
              scale: 0,
              opacity: 0,
              y: '-50%',
              x: '-8px'
            },
            hover: {
              rotate: 0,
              scale: 1.0,
              opacity: 1,
              y: '-50%',
              x: '0px'
            }
          }}
          transition={{
            duration: 0.35,
            ease: "easeInOut"
          }}
        >
          {item.icon_type === 'emoji' ? (
            item.icon_url
          ) : item.icon_type === 'image' ? (
            <img 
              src={item.icon_url} 
              alt={`${item.title} icon`}
              className="w-8 h-8"
              draggable={false}
            />
          ) : (
            <i className={item.icon_url} />
          )}
        </motion.span>
      )}
      
      {/* Texto com animação no hover */}
      <motion.span 
        className="whitespace-nowrap relative z-10 pointer-events-none select-none"
        variants={{
          initial: {
            fontWeight: 400, // font-normal
            letterSpacing: '0em',
          },
          hover: {
            fontWeight: 500, // font-medium (mais sutil que bold)
            letterSpacing: '0.025em',
          }
        }}
        transition={{ 
          duration: 0.2,
          ease: "easeInOut"
        }}
      >
        {item.title}
      </motion.span>
    </motion.div>
  );

  // Se for link interno, usar React Router Link
  if (item.link_type === 'internal') {
    return (
      <Link 
        to={item.link_url} 
        className="inline-block"
      >
        <ItemContent />
      </Link>
    );
  }

  // Se for link externo, usar div com onClick
  return <ItemContent />;
};

