import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PromotionalRibbonProps {
  isVisible?: boolean;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  link?: string;
  className?: string;
  backgroundType?: 'solid' | 'gradient';
  gradientColors?: string;
}

const PromotionalRibbon: React.FC<PromotionalRibbonProps> = ({
  isVisible = false,
  text = "Oferta especial disponível!",
  backgroundColor = "#6B46C1",
  textColor = "#FFFFFF",
  link,
  className,
  backgroundType = 'solid',
  gradientColors
}) => {
  const navigate = useNavigate();

  if (!isVisible || !text) {
    return null;
  }

  const handleClick = () => {
    if (link && link.trim() !== '' && link !== '#') {
      if (link.startsWith('http')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        // Usar navigate como nos links rápidos
        navigate(link);
      }
    }
  };

  // Função para obter o estilo de fundo
  const getBackgroundStyle = () => {
    if (backgroundType === 'gradient' && gradientColors) {
      const colors = gradientColors.split(',').map(color => color.trim());
      if (colors.length >= 2) {
        return {
          background: `linear-gradient(135deg, ${colors.join(', ')})`,
          color: textColor,
        };
      }
    }
    return {
      backgroundColor,
      color: textColor,
    };
  };

  const ribbonContent = (
    <div
      className={cn(
        "w-full h-[40px] flex items-center justify-center text-base font-semibold transition-all duration-200 promotional-ribbon-poppins",
        link && link.trim() !== '' && link !== '#' && "cursor-pointer hover:opacity-90",
        className
      )}
      style={{
        ...getBackgroundStyle(),
        fontFamily: 'Poppins, sans-serif', // Adicionada fonte Poppins
      }}
      onClick={handleClick}
    >
      <div className="container mx-auto px-4 text-center">
        <span className="truncate">{text}</span>
      </div>
    </div>
  );

  return ribbonContent;
};

export default PromotionalRibbon;

