import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConfigurableNavigation } from '@/components/Navigation';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface DesktopNavigationProps {
  className?: string;
}

const DesktopNavigation = ({ className }: DesktopNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🎯 OTIMIZADO: Hook de detecção de direção do scroll com resposta mais rápida
  const { scrollDirection, isScrolled } = useScrollDirection({
    threshold: 10, // Reduzido de 25 para 10px - mais sensível e rápido
    debounceMs: 8  // Reduzido de 16 para 8ms - menos delay
  });
  
  // Determina se a barra deve estar oculta baseado no scroll
  const shouldBeHidden = scrollDirection === 'down' && isScrolled;

  return (
    <nav
      className={cn(
        // 🎯 CORREÇÃO: Mostra apenas em desktop (lg+), tablets usam layout mobile
        'hidden lg:block bg-background border-t border-border/60',
        'fixed top-[72px] left-0 right-0 z-40', // Fixo ao invés de sticky, posicionado abaixo do MainHeader
        // 🎯 ANIMAÇÃO OTIMIZADA: Transições mais rápidas e responsivas
        'transition-transform duration-150 ease-in-out', // Reduzido de 200ms para 150ms
        {
          '-translate-y-full': shouldBeHidden, // Esconde quando scroll para baixo
          'translate-y-0': !shouldBeHidden, // Mostra quando scroll para cima ou no topo
        },
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className={cn(
          "flex h-12 items-center justify-center", // Aumentado de h-10 (40px) para h-12 (48px) para melhor proporção
          // 🎯 RESPONSIVIDADE: Ajusta espaçamento conforme o tamanho da tela
          "gap-x-2 md:gap-x-3 lg:gap-x-4 xl:gap-x-6" // Aumentado o espaçamento
        )}>
          {/* Navegação configurável do banco de dados */}
          <ConfigurableNavigation 
            showOnlyVisible={true}
            className={cn(
              "flex items-center",
              // 🎯 RESPONSIVIDADE: Ajusta espaçamento dos botões conforme a tela
              "gap-x-1 md:gap-x-2 lg:gap-x-3 xl:gap-x-4"
            )}
          />
        </div>
      </div>
    </nav>
  );
};

export default DesktopNavigation;

