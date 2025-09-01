import { PlatformPage, NewsSection, PLATFORM_THEMES } from '@/types/platformPages';

// Dados mock para as páginas personalizadas
export const customPlatformPages: PlatformPage[] = [
  // Xbox - Redesenhada
  {
    id: 'xbox-custom',
    title: 'Xbox',
    slug: 'xbox',
    description: 'Descubra o poder do Xbox: consoles de última geração, jogos exclusivos e Game Pass',
    isActive: true,
    theme: PLATFORM_THEMES.xbox,
    metaTitle: 'Xbox - Consoles, Jogos e Acessórios | UTI dos Games',
    metaDescription: 'Explore o universo Xbox com consoles Series X|S, jogos exclusivos, Game Pass e acessórios oficiais. A melhor experiência gaming está aqui!',
    keywords: ['xbox', 'xbox series x', 'xbox series s', 'game pass', 'microsoft', 'consoles'],
    layout: 'wide',
    headerStyle: 'transparent',
    footerStyle: 'default',
    sections: [
      {
        id: 'xbox-hero',
        type: 'banner',
        title: 'Banner Principal Xbox',
        displayOrder: 1,
        isVisible: true,
        bannerConfig: {
          type: 'hero',
          layout: 'full-width',
          title: 'Xbox Series X|S',
          subtitle: 'Poder. Velocidade. Compatibilidade.',
          description: 'Experimente a próxima geração de jogos com carregamento ultrarrápido, mundos mais ricos e jogabilidade aprimorada.',
          ctaText: 'Explorar Consoles',
          ctaLink: '/categoria/xbox-consoles',
          backgroundType: 'gradient',
          contentPosition: 'left',
          textAlign: 'left',
          overlay: {
            color: 'rgba(0, 0, 0, 0.3)',
            opacity: 0.3
          }
        },
        fullWidth: true
      },
      {
        id: 'xbox-featured',
        type: 'products',
        title: 'Produtos em Destaque',
        displayOrder: 2,
        isVisible: true,
        productConfig: {
          type: 'featured',
          title: 'Destaques Xbox',
          subtitle: 'Os melhores produtos Xbox em oferta especial',
          filter: {
            tagIds: ['28047409-2ad5-4cea-bde3-803d42e49fc6'], // UUID da tag "Xbox"
            featured: true,
            limit: 8
          },
          columns: 4,
          showPrices: true,
          showBadges: true,
          cardStyle: 'detailed'
        },
        fullWidth: false
      },
      {
        id: 'xbox-news',
        type: 'news',
        title: 'Notícias Xbox',
        displayOrder: 3,
        isVisible: true,
        newsConfig: {
          layout: 'grid',
          articles: [
            {
              id: 'xbox-news-1',
              title: 'Xbox Game Pass Ultimate: Novos Jogos em Janeiro',
              category: 'Game Pass',
              excerpt: 'Descubra os novos títulos que chegaram ao Xbox Game Pass Ultimate este mês, incluindo grandes lançamentos e indies incríveis.',
              imageUrl: '/news/xbox-gamepass-january.jpg',
              publishDate: '2025-01-15',
              readTime: '3 min',
              tags: ['Game Pass', 'Lançamentos', 'Xbox'],
              link: '/noticias/xbox-gamepass-janeiro-2025'
            },
            {
              id: 'xbox-news-2',
              title: 'Forza Motorsport: Nova Atualização Disponível',
              category: 'Jogos',
              excerpt: 'A mais recente atualização do Forza Motorsport traz novos carros, pistas e melhorias de performance para todos os jogadores.',
              imageUrl: '/news/forza-motorsport-update.jpg',
              publishDate: '2025-01-12',
              readTime: '5 min',
              tags: ['Forza', 'Atualização', 'Racing'],
              link: '/noticias/forza-motorsport-atualizacao'
            },
            {
              id: 'xbox-news-3',
              title: 'Xbox Series X: Disponibilidade Melhorada',
              category: 'Hardware',
              excerpt: 'Microsoft anuncia maior disponibilidade do Xbox Series X em lojas brasileiras, facilitando a compra do console.',
              imageUrl: '/news/xbox-series-x-stock.jpg',
              publishDate: '2025-01-10',
              readTime: '2 min',
              tags: ['Xbox Series X', 'Disponibilidade', 'Brasil'],
              link: '/noticias/xbox-series-x-disponibilidade'
            }
          ]
        },
        backgroundColor: '#0E6B0E',
        fullWidth: true
      },
      {
        id: 'xbox-accessories',
        type: 'products',
        title: 'Acessórios Xbox',
        displayOrder: 4,
        isVisible: true,
        productConfig: {
          type: 'grid',
          title: 'Acessórios Oficiais',
          subtitle: 'Controles, headsets e mais para sua experiência Xbox',
          filter: {
            tagIds: ['28047409-2ad5-4cea-bde3-803d42e49fc6', '43f59a81-8dd1-460b-be1e-a0187e743075'], // UUIDs das tags "Xbox" e "Acessórios"
            limit: 6
          },
          columns: 3,
          showPrices: true,
          showBadges: true,
          cardStyle: 'compact'
        },
        fullWidth: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // PlayStation - Redesenhada
  {
    id: 'playstation-custom',
    title: 'PlayStation',
    slug: 'playstation',
    description: 'Entre no universo PlayStation: PS5, jogos exclusivos e experiências únicas',
    isActive: true,
    theme: PLATFORM_THEMES.playstation,
    metaTitle: 'PlayStation - PS5, Jogos Exclusivos e Acessórios | UTI dos Games',
    metaDescription: 'Descubra o mundo PlayStation com PS5, jogos exclusivos incríveis, DualSense e muito mais. Jogue sem limites!',
    keywords: ['playstation', 'ps5', 'ps4', 'sony', 'dualsense', 'exclusivos'],
    layout: 'wide',
    headerStyle: 'transparent',
    footerStyle: 'default',
    sections: [
      {
        id: 'ps-hero',
        type: 'banner',
        title: 'Banner Principal PlayStation',
        displayOrder: 1,
        isVisible: true,
        bannerConfig: {
          type: 'hero',
          layout: 'full-width',
          title: 'PlayStation 5',
          subtitle: 'Jogue Sem Limites',
          description: 'Experimente carregamento ultrarrápido com o SSD personalizado, feedback háptico mais profundo e áudio 3D imersivo.',
          ctaText: 'Descobrir PS5',
          ctaLink: '/categoria/playstation-consoles',
          backgroundType: 'gradient',
          contentPosition: 'center',
          textAlign: 'center',
          overlay: {
            color: 'rgba(0, 55, 145, 0.2)',
            opacity: 0.2
          }
        },
        fullWidth: true
      },
      {
        id: 'ps-exclusives',
        type: 'products',
        title: 'Jogos Exclusivos',
        displayOrder: 2,
        isVisible: true,
        productConfig: {
          type: 'carousel',
          title: 'Exclusivos PlayStation',
          subtitle: 'Experiências que só você encontra no PlayStation',
          filter: {
            tagIds: ['playstation', 'exclusivo'],
            limit: 10
          },
          showPrices: true,
          showBadges: true,
          cardStyle: 'detailed'
        },
        fullWidth: false
      },
      {
        id: 'ps-news',
        type: 'news',
        title: 'Notícias PlayStation',
        displayOrder: 3,
        isVisible: true,
        newsConfig: {
          layout: 'list',
          articles: [
            {
              id: 'ps-news-1',
              title: 'God of War Ragnarök: DLC Valhalla Já Disponível',
              category: 'Exclusivos',
              excerpt: 'O aguardado DLC gratuito de God of War Ragnarök está disponível, trazendo novas aventuras com Kratos em Valhalla.',
              imageUrl: '/news/god-of-war-valhalla.jpg',
              publishDate: '2025-01-14',
              readTime: '4 min',
              tags: ['God of War', 'DLC', 'Exclusivo'],
              link: '/noticias/god-of-war-ragnarok-valhalla'
            },
            {
              id: 'ps-news-2',
              title: 'PlayStation Plus: Jogos Gratuitos de Janeiro',
              category: 'PlayStation Plus',
              excerpt: 'Confira os jogos gratuitos disponíveis para assinantes do PlayStation Plus neste mês, incluindo títulos AAA.',
              imageUrl: '/news/ps-plus-january.jpg',
              publishDate: '2025-01-11',
              readTime: '3 min',
              tags: ['PlayStation Plus', 'Gratuitos', 'Assinatura'],
              link: '/noticias/ps-plus-jogos-janeiro-2025'
            }
          ]
        },
        backgroundColor: '#003791',
        fullWidth: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Nintendo - Redesenhada
  {
    id: 'nintendo-custom',
    title: 'Nintendo',
    slug: 'nintendo',
    description: 'O mundo mágico da Nintendo: Switch, jogos para toda família e diversão garantida',
    isActive: true,
    theme: PLATFORM_THEMES.nintendo,
    metaTitle: 'Nintendo - Switch, Jogos Familiares e Diversão | UTI dos Games',
    metaDescription: 'Entre no universo Nintendo com Switch, jogos icônicos como Mario e Zelda, e diversão para toda a família!',
    keywords: ['nintendo', 'switch', 'mario', 'zelda', 'pokemon', 'familia'],
    layout: 'standard',
    headerStyle: 'colored',
    footerStyle: 'extended',
    sections: [
      {
        id: 'nintendo-hero',
        type: 'banner',
        title: 'Banner Principal Nintendo',
        displayOrder: 1,
        isVisible: true,
        bannerConfig: {
          type: 'hero',
          layout: 'split',
          title: 'Nintendo Switch',
          subtitle: 'Diversão Para Todos, Em Qualquer Lugar',
          description: 'Jogue em casa ou em movimento com o console híbrido que revolucionou os games.',
          ctaText: 'Explorar Nintendo',
          ctaLink: '/categoria/nintendo-consoles',
          backgroundType: 'gradient',
          contentPosition: 'left',
          textAlign: 'left'
        },
        fullWidth: true
      },
      {
        id: 'nintendo-family',
        type: 'products',
        title: 'Jogos para Família',
        displayOrder: 2,
        isVisible: true,
        productConfig: {
          type: 'grid',
          title: 'Diversão em Família',
          subtitle: 'Jogos perfeitos para jogar com toda a família',
          filter: {
            tagIds: ['nintendo', 'familia'],
            limit: 8
          },
          columns: 4,
          showPrices: true,
          showBadges: true,
          cardStyle: 'detailed'
        },
        fullWidth: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // PC Gaming - Nova
  {
    id: 'pc-gaming-custom',
    title: 'PC Gaming',
    slug: 'pc-gaming',
    description: 'O melhor do PC Gaming: componentes, periféricos e jogos para verdadeiros entusiastas',
    isActive: true,
    theme: PLATFORM_THEMES.pcgaming,
    metaTitle: 'PC Gaming - Componentes, Periféricos e Jogos | UTI dos Games',
    metaDescription: 'Descubra o mundo PC Gaming com componentes de alta performance, periféricos profissionais e os melhores jogos.',
    keywords: ['pc gaming', 'componentes', 'perifericos', 'steam', 'hardware'],
    layout: 'wide',
    headerStyle: 'default',
    footerStyle: 'default',
    sections: [
      {
        id: 'pc-hero',
        type: 'banner',
        title: 'Banner Principal PC Gaming',
        displayOrder: 1,
        isVisible: true,
        bannerConfig: {
          type: 'hero',
          layout: 'overlay',
          title: 'PC Master Race',
          subtitle: 'Performance Sem Limites',
          description: 'Monte seu setup dos sonhos com os melhores componentes e periféricos para PC Gaming.',
          ctaText: 'Explorar Componentes',
          ctaLink: '/categoria/pc-gaming',
          backgroundType: 'gradient',
          contentPosition: 'center',
          textAlign: 'center'
        },
        fullWidth: true
      },
      {
        id: 'pc-components',
        type: 'products',
        title: 'Componentes',
        displayOrder: 2,
        isVisible: true,
        productConfig: {
          type: 'grid',
          title: 'Componentes de Alta Performance',
          subtitle: 'Placas de vídeo, processadores e mais',
          filter: {
            tagIds: ['pc', 'componente'],
            limit: 6
          },
          columns: 3,
          showPrices: true,
          showBadges: true,
          cardStyle: 'detailed'
        },
        fullWidth: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Xbox 360/PS2 - Nova (Retrô)
  {
    id: 'retro-gaming-custom',
    title: 'Xbox 360/PS2',
    slug: 'retro-gaming',
    description: 'Nostalgia em estado puro: jogos clássicos do Xbox 360 e PlayStation 2',
    isActive: true,
    theme: PLATFORM_THEMES.retro,
    metaTitle: 'Xbox 360 e PS2 - Jogos Clássicos e Nostalgia | UTI dos Games',
    metaDescription: 'Reviva os clássicos com nossa seleção de jogos do Xbox 360 e PlayStation 2. Nostalgia garantida!',
    keywords: ['xbox 360', 'ps2', 'playstation 2', 'retro', 'classicos', 'nostalgia'],
    layout: 'standard',
    headerStyle: 'default',
    footerStyle: 'default',
    sections: [
      {
        id: 'retro-hero',
        type: 'banner',
        title: 'Banner Principal Retrô',
        displayOrder: 1,
        isVisible: true,
        bannerConfig: {
          type: 'hero',
          layout: 'full-width',
          title: 'Jogos Clássicos',
          subtitle: 'Xbox 360 & PlayStation 2',
          description: 'Reviva os momentos épicos com nossa coleção de jogos clássicos que marcaram uma geração.',
          ctaText: 'Ver Clássicos',
          ctaLink: '/categoria/retro-gaming',
          backgroundType: 'gradient',
          contentPosition: 'center',
          textAlign: 'center'
        },
        fullWidth: true
      },
      {
        id: 'retro-classics',
        type: 'products',
        title: 'Clássicos Atemporais',
        displayOrder: 2,
        isVisible: true,
        productConfig: {
          type: 'grid',
          title: 'Clássicos Atemporais',
          subtitle: 'Os jogos que marcaram uma geração',
          filter: {
            tagIds: ['xbox360', 'ps2', 'classico'],
            limit: 8
          },
          columns: 4,
          showPrices: true,
          showBadges: true,
          cardStyle: 'compact'
        },
        fullWidth: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Área Geek - Nova
  {
    id: 'area-geek-custom',
    title: 'Área Geek',
    slug: 'area-geek',
    description: 'Universo geek completo: colecionáveis, action figures, merchandise e cultura pop',
    isActive: true,
    theme: PLATFORM_THEMES.geek,
    metaTitle: 'Área Geek - Colecionáveis, Action Figures e Merchandise | UTI dos Games',
    metaDescription: 'Explore o universo geek com colecionáveis exclusivos, action figures, merchandise e muito mais da cultura pop!',
    keywords: ['geek', 'colecionaveis', 'action figures', 'merchandise', 'cultura pop', 'anime'],
    layout: 'wide',
    headerStyle: 'colored',
    footerStyle: 'extended',
    sections: [
      {
        id: 'geek-hero',
        type: 'banner',
        title: 'Banner Principal Geek',
        displayOrder: 1,
        isVisible: true,
        bannerConfig: {
          type: 'hero',
          layout: 'split',
          title: 'Área Geek',
          subtitle: 'Sua Paixão, Nossa Especialidade',
          description: 'Descubra colecionáveis únicos, action figures exclusivos e merchandise oficial dos seus universos favoritos.',
          ctaText: 'Explorar Colecionáveis',
          ctaLink: '/categoria/area-geek',
          backgroundType: 'gradient',
          contentPosition: 'right',
          textAlign: 'right'
        },
        fullWidth: true
      },
      {
        id: 'geek-collectibles',
        type: 'products',
        title: 'Colecionáveis',
        displayOrder: 2,
        isVisible: true,
        productConfig: {
          type: 'featured',
          title: 'Colecionáveis Exclusivos',
          subtitle: 'Itens únicos para verdadeiros colecionadores',
          filter: {
            tagIds: ['geek', 'colecionavel'],
            featured: true,
            limit: 6
          },
          columns: 3,
          showPrices: true,
          showBadges: true,
          cardStyle: 'detailed'
        },
        fullWidth: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

