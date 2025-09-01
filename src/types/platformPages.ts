// Tipos para o sistema de páginas personalizadas
export interface PlatformTheme {
  // Cores principais
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Gradientes
  primaryGradient?: string;
  secondaryGradient?: string;
  
  // Imagens
  bannerImage?: string;
  logoImage?: string;
  backgroundPattern?: string;
  
  // Tipografia
  fontFamily?: string;
  headingFont?: string;
  
  // Efeitos
  shadowColor?: string;
  borderRadius?: string;
  
  // Específicos da plataforma
  brandElements?: {
    iconColor?: string;
    buttonStyle?: 'rounded' | 'sharp' | 'pill';
    cardStyle?: 'elevated' | 'flat' | 'outlined';
    animationStyle?: 'smooth' | 'sharp' | 'bouncy';
  };
}

export interface BannerConfig {
  type: 'hero' | 'promotional' | 'news' | 'product-showcase';
  layout: 'full-width' | 'split' | 'overlay' | 'carousel' | 'grid';
  
  // Conteúdo
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  
  // Visual
  imageUrl?: string;
  videoUrl?: string;
  backgroundType: 'image' | 'video' | 'gradient' | 'pattern';
  
  // Posicionamento
  contentPosition: 'left' | 'center' | 'right' | 'bottom' | 'top';
  textAlign: 'left' | 'center' | 'right';
  
  // Efeitos
  parallax?: boolean;
  animation?: string;
  overlay?: {
    color: string;
    opacity: number;
  };
}

export interface NewsSection {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  publishDate: string;
  readTime?: string;
  tags: string[];
  link: string;
}

export interface ProductShowcase {
  type: 'grid' | 'carousel' | 'featured' | 'comparison';
  title: string;
  subtitle?: string;
  
  // Filtros
  filter: {
    tagIds?: string[];
    categoryIds?: string[];
    featured?: boolean;
    newReleases?: boolean;
    onSale?: boolean;
    limit?: number;
  };
  
  // Layout
  columns?: number;
  showPrices?: boolean;
  showBadges?: boolean;
  cardStyle?: 'compact' | 'detailed' | 'minimal';
}

export interface PlatformSection {
  id: string;
  type: 'banner' | 'products' | 'news' | 'features' | 'testimonials' | 'gallery';
  title: string;
  displayOrder: number;
  isVisible: boolean;
  
  // Configurações específicas por tipo
  bannerConfig?: BannerConfig;
  productConfig?: ProductShowcase;
  newsConfig?: {
    articles: NewsSection[];
    layout: 'list' | 'grid' | 'carousel';
  };
  
  // Configurações visuais
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  fullWidth?: boolean;
}

export interface PlatformPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  
  // Tema da página
  theme: PlatformTheme;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Seções da página
  sections: PlatformSection[];
  
  // Configurações gerais
  layout: 'standard' | 'wide' | 'full-screen';
  headerStyle: 'default' | 'transparent' | 'colored';
  footerStyle: 'default' | 'minimal' | 'extended';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Tipos para o painel administrativo
export interface PlatformPageFormData {
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  theme: PlatformTheme;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  layout: 'standard' | 'wide' | 'full-screen';
  headerStyle: 'default' | 'transparent' | 'colored';
  footerStyle: 'default' | 'minimal' | 'extended';
}

export interface SectionFormData {
  type: 'banner' | 'products' | 'news' | 'features' | 'testimonials' | 'gallery';
  title: string;
  displayOrder: number;
  isVisible: boolean;
  config: any; // Configuração específica baseada no tipo
}

// Presets de temas para cada plataforma
export const PLATFORM_THEMES = {
  xbox: {
    primaryColor: '#107C10',
    secondaryColor: '#0E6B0E',
    accentColor: '#52B043',
    backgroundColor: '#1E1E1E',
    textColor: '#FFFFFF',
    primaryGradient: 'linear-gradient(135deg, #107C10 0%, #52B043 100%)',
    secondaryGradient: 'linear-gradient(135deg, #0E6B0E 0%, #107C10 100%)',
    shadowColor: 'rgba(16, 124, 16, 0.3)',
    borderRadius: '8px',
    brandElements: {
      iconColor: '#52B043',
      buttonStyle: 'rounded' as const,
      cardStyle: 'elevated' as const,
      animationStyle: 'smooth' as const,
    }
  },
  playstation: {
    primaryColor: '#0070D1',
    secondaryColor: '#003791',
    accentColor: '#FFFFFF',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    primaryGradient: 'linear-gradient(135deg, #0070D1 0%, #003791 100%)',
    secondaryGradient: 'linear-gradient(135deg, #003791 0%, #0070D1 100%)',
    shadowColor: 'rgba(0, 112, 209, 0.3)',
    borderRadius: '12px',
    brandElements: {
      iconColor: '#0070D1',
      buttonStyle: 'sharp' as const,
      cardStyle: 'flat' as const,
      animationStyle: 'sharp' as const,
    }
  },
  nintendo: {
    primaryColor: '#E60012',
    secondaryColor: '#CC0010',
    accentColor: '#00C3E3',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    primaryGradient: 'linear-gradient(135deg, #E60012 0%, #CC0010 100%)',
    secondaryGradient: 'linear-gradient(135deg, #00C3E3 0%, #0099B3 100%)',
    shadowColor: 'rgba(230, 0, 18, 0.3)',
    borderRadius: '16px',
    brandElements: {
      iconColor: '#E60012',
      buttonStyle: 'pill' as const,
      cardStyle: 'elevated' as const,
      animationStyle: 'bouncy' as const,
    }
  },
  pcgaming: {
    primaryColor: '#FF6B35',
    secondaryColor: '#E55A2B',
    accentColor: '#FFD23F',
    backgroundColor: '#1A1A1A',
    textColor: '#FFFFFF',
    primaryGradient: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
    secondaryGradient: 'linear-gradient(135deg, #FFD23F 0%, #FF6B35 100%)',
    shadowColor: 'rgba(255, 107, 53, 0.3)',
    borderRadius: '6px',
    brandElements: {
      iconColor: '#FFD23F',
      buttonStyle: 'sharp' as const,
      cardStyle: 'outlined' as const,
      animationStyle: 'smooth' as const,
    }
  },
  retro: {
    primaryColor: '#8B4513',
    secondaryColor: '#A0522D',
    accentColor: '#DAA520',
    backgroundColor: '#2F1B14',
    textColor: '#F5DEB3',
    primaryGradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    secondaryGradient: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
    shadowColor: 'rgba(139, 69, 19, 0.3)',
    borderRadius: '4px',
    brandElements: {
      iconColor: '#DAA520',
      buttonStyle: 'rounded' as const,
      cardStyle: 'elevated' as const,
      animationStyle: 'smooth' as const,
    }
  },
  geek: {
    primaryColor: '#9C27B0',
    secondaryColor: '#7B1FA2',
    accentColor: '#E91E63',
    backgroundColor: '#121212',
    textColor: '#FFFFFF',
    primaryGradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
    secondaryGradient: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
    shadowColor: 'rgba(156, 39, 176, 0.3)',
    borderRadius: '20px',
    brandElements: {
      iconColor: '#E91E63',
      buttonStyle: 'pill' as const,
      cardStyle: 'elevated' as const,
      animationStyle: 'bouncy' as const,
    }
  }
} as const;

