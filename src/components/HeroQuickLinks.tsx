import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuickLinks } from '@/hooks/useQuickLinks';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroQuickLinks = React.memo(() => {
  const navigate = useNavigate();
  const { quickLinks, loading, fetchQuickLinks } = useQuickLinks();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchQuickLinks();
  }, [fetchQuickLinks]);

  const handleQuickLinkClick = useCallback((path: string) => {
    if (path && path.trim() !== '' && path !== '#') {
      navigate(path);
    } else {
      console.warn('Invalid path provided for quick link:', path);
    }
  }, [navigate]);

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = '/placeholder-icon.svg';
    event.currentTarget.onerror = null;
  }, []);

  // Memoizar skeleton loading
  const skeletonItems = useMemo(() => 
    [...Array(6)].map((_, i) => (
      <div key={`skeleton-${i}`} className="w-32 h-32 md:w-36 md:h-36 rounded-lg bg-gray-100 animate-pulse" />
    )), 
    []
  );

  // Memoizar componente de link
  const QuickLinkButton = React.memo(({ link }: { link: any }) => (
    <button
      onClick={() => handleQuickLinkClick(link.path)}
      className={cn(
        "flex flex-col items-center justify-center",
        "w-32 h-32 md:w-36 md:h-36",
        "bg-white border border-gray-200",
        "rounded-lg",
        "hover:border-gray-300 hover:shadow-sm",
        "transition-all duration-200",
        "text-gray-700 hover:text-gray-900",
        "group",
        "p-4"
      )}
    >
      <img
        src={link.icon_url}
        alt={link.label}
        className="w-8 h-8 md:w-10 md:h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-200 mb-2"
        loading="lazy"
        onError={handleImageError}
      />
      <span className="text-xs md:text-sm font-medium text-center leading-tight">
        {link.label}
      </span>
    </button>
  ));

  return (
    <section className="py-6 md:py-8 bg-gray-50/30 border-b border-gray-100">
      <div className="container mx-auto px-4">
        {/* Título */}
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6 font-['Poppins']">
          Do que Você Precisa?
        </h2>
        
        {/* Grid de Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
          {loading && skeletonItems}

          {!loading && quickLinks.length === 0 && (
            <p className="text-center text-muted-foreground py-4 col-span-full text-sm">
              Nenhum link rápido configurado.
            </p>
          )}

          {!loading && quickLinks.map((link) => (
            <QuickLinkButton key={link.id} link={link} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default HeroQuickLinks;

