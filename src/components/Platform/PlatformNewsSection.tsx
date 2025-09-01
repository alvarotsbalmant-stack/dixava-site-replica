import React from 'react';
import { NewsSection, PlatformTheme } from '@/types/platformPages';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, ExternalLink } from 'lucide-react';

interface PlatformNewsSectionProps {
  articles: NewsSection[];
  theme: PlatformTheme;
  layout: 'list' | 'grid' | 'carousel';
  title?: string;
  subtitle?: string;
  className?: string;
}

const PlatformNewsSection: React.FC<PlatformNewsSectionProps> = ({
  articles,
  theme,
  layout,
  title = 'Últimas Notícias',
  subtitle,
  className = ''
}) => {
  const getCardStyles = () => {
    const baseStyles = {
      backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#FAFAFA' : 'rgba(255, 255, 255, 0.05)',
      borderColor: theme.accentColor,
      borderRadius: theme.borderRadius,
    };

    switch (theme.brandElements?.cardStyle) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: `0 8px 25px ${theme.shadowColor}`,
          border: 'none',
        };
      case 'flat':
        return {
          ...baseStyles,
          boxShadow: 'none',
          border: 'none',
        };
      case 'outlined':
        return {
          ...baseStyles,
          boxShadow: 'none',
          border: `2px solid ${theme.accentColor}`,
        };
      default:
        return baseStyles;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderNewsCard = (article: NewsSection, featured = false) => (
    <Card 
      key={article.id}
      className="group cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden"
      style={getCardStyles()}
      onClick={() => window.open(article.link, '_blank')}
    >
      <CardContent className="p-0">
        {/* Imagem */}
        <div className={`relative overflow-hidden ${featured ? 'aspect-video' : 'aspect-[4/3]'}`}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Overlay com categoria */}
          <div className="absolute top-4 left-4">
            <Badge 
              className="text-xs font-semibold"
              style={{
                backgroundColor: theme.primaryColor,
                color: theme.textColor,
              }}
            >
              {article.category}
            </Badge>
          </div>

          {/* Tags */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
            {article.tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index}
                variant="outline"
                className="text-xs"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: theme.accentColor,
                  color: theme.accentColor,
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className={`p-${featured ? '6' : '4'}`}>
          <h3 
            className={`font-bold mb-3 line-clamp-2 ${featured ? 'text-xl' : 'text-lg'}`}
            style={{ color: theme.textColor }}
          >
            {article.title}
          </h3>

          <p 
            className={`mb-4 line-clamp-3 opacity-80 ${featured ? 'text-base' : 'text-sm'}`}
            style={{ color: theme.textColor }}
          >
            {article.excerpt}
          </p>

          {/* Meta informações */}
          <div className="flex items-center justify-between text-sm opacity-70 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" style={{ color: theme.accentColor }} />
                <span style={{ color: theme.textColor }}>
                  {formatDate(article.publishDate)}
                </span>
              </div>
              {article.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" style={{ color: theme.accentColor }} />
                  <span style={{ color: theme.textColor }}>
                    {article.readTime}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botão de leitura */}
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:scale-105 transition-transform duration-300"
            style={{
              borderColor: theme.accentColor,
              color: theme.accentColor,
              borderRadius: theme.borderRadius,
            }}
          >
            Ler Mais
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderListLayout = () => (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <Card 
          key={article.id}
          className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden"
          style={getCardStyles()}
          onClick={() => window.open(article.link, '_blank')}
        >
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Imagem */}
              <div className="relative aspect-video md:aspect-square overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <Badge 
                    className="text-xs font-semibold"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: theme.textColor,
                    }}
                  >
                    {article.category}
                  </Badge>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="md:col-span-2 p-6 flex flex-col justify-between">
                <div>
                  <h3 
                    className="text-xl font-bold mb-3 line-clamp-2"
                    style={{ color: theme.textColor }}
                  >
                    {article.title}
                  </h3>

                  <p 
                    className="text-base mb-4 line-clamp-3 opacity-80"
                    style={{ color: theme.textColor }}
                  >
                    {article.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex}
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: theme.accentColor,
                          color: theme.accentColor,
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm opacity-70">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" style={{ color: theme.accentColor }} />
                      <span style={{ color: theme.textColor }}>
                        {formatDate(article.publishDate)}
                      </span>
                    </div>
                    {article.readTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" style={{ color: theme.accentColor }} />
                        <span style={{ color: theme.textColor }}>
                          {article.readTime}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      borderColor: theme.accentColor,
                      color: theme.accentColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => renderNewsCard(article, index === 0))}
    </div>
  );

  const renderCarouselLayout = () => (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
      {articles.map((article) => (
        <div key={article.id} className="flex-none w-80">
          {renderNewsCard(article)}
        </div>
      ))}
    </div>
  );

  return (
    <section 
      className={`py-16 ${className}`}
      style={{
        backgroundColor: theme.secondaryColor || theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: theme.headingFont || theme.fontFamily,
              color: theme.textColor,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p 
              className="text-xl"
              style={{ color: theme.accentColor }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Renderizar layout baseado no tipo */}
        {layout === 'list' && renderListLayout()}
        {layout === 'grid' && renderGridLayout()}
        {layout === 'carousel' && renderCarouselLayout()}

        {/* Botão para ver mais notícias */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="text-lg px-8 py-4 font-semibold"
            style={{
              backgroundColor: theme.accentColor,
              color: theme.backgroundColor,
              borderRadius: theme.borderRadius,
            }}
          >
            Ver Todas as Notícias
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlatformNewsSection;

