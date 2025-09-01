
import { Page, PageLayoutItem } from './types';

// Mock pages data with string IDs
export const mockPages: Page[] = [
  {
    id: "xbox-page",
    title: "Xbox",
    slug: "xbox",
    description: "Página dedicada aos produtos Xbox",
    isActive: true,
    theme: {
      primaryColor: "#107C10",
      secondaryColor: "#3A3A3A"
    },
    filters: {
      tagIds: ["xbox", "console", "gaming"],
      categoryIds: ["consoles"]
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "playstation-page",
    title: "PlayStation",
    slug: "playstation",
    description: "Página dedicada aos produtos PlayStation",
    isActive: true,
    theme: {
      primaryColor: "#003087",
      secondaryColor: "#FFFFFF"
    },
    filters: {
      tagIds: ["playstation", "console", "gaming"],
      categoryIds: ["consoles"]
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "nintendo-page",
    title: "Nintendo",
    slug: "nintendo",
    description: "Página dedicada aos produtos Nintendo",
    isActive: true,
    theme: {
      primaryColor: "#E60012",
      secondaryColor: "#0066CC"
    },
    filters: {
      tagIds: ["nintendo", "console", "gaming"],
      categoryIds: ["consoles"]
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "pc-gaming-page",
    title: "PC Gaming",
    slug: "pc-gaming",
    description: "Página dedicada aos produtos de PC Gaming",
    isActive: true,
    theme: {
      primaryColor: "#FF6B00",
      secondaryColor: "#2D2D2D"
    },
    filters: {
      tagIds: ["pc", "gaming", "computer"],
      categoryIds: ["pc-gaming"]
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "retro-gaming-page",
    title: "Retro Gaming",
    slug: "retro-gaming",
    description: "Página dedicada aos produtos de Retro Gaming",
    isActive: true,
    theme: {
      primaryColor: "#8B4513",
      secondaryColor: "#F4A460"
    },
    filters: {
      tagIds: ["retro", "vintage", "classic"],
      categoryIds: ["retro-gaming"]
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "area-geek-page",
    title: "Área Geek",
    slug: "area-geek",
    description: "Página dedicada aos produtos da Área Geek",
    isActive: true,
    theme: {
      primaryColor: "#9932CC",
      secondaryColor: "#FFD700"
    },
    filters: {
      tagIds: ["geek", "collectibles", "merchandise"],
      categoryIds: ["area-geek"]
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

// Mock layout items for the Xbox page
export const mockPageLayoutItems: Record<string, PageLayoutItem[]> = {
  "xbox-page": [
    {
      id: "xbox-banner-1",
      page_id: "xbox-page",
      section_key: "hero_banner",
      title: "Banner Principal Xbox",
      display_order: 1,
      is_visible: true,
      section_type: "banner",
      sectionConfig: {
        title: "Xbox Series X|S",
        subtitle: "A nova geração de gaming está aqui",
        imageUrl: "/banners/xbox-banner.jpg",
        ctaText: "Ver Consoles",
        ctaLink: "/xbox/consoles"
      },
      pageId: "xbox-page",
      sectionKey: "hero_banner",
      displayOrder: 1,
      isVisible: true,
      sectionType: "banner"
    },
    {
      id: "xbox-products-1",
      page_id: "xbox-page",
      section_key: "featured_products",
      title: "Produtos em Destaque",
      display_order: 2,
      is_visible: true,
      section_type: "products",
      sectionConfig: {
        filter: {
          tagIds: ["xbox", "featured"],
          limit: 8
        }
      },
      pageId: "xbox-page",
      sectionKey: "featured_products",
      displayOrder: 2,
      isVisible: true,
      sectionType: "products"
    },
    {
      id: "xbox-accessories-1",
      page_id: "xbox-page",
      section_key: "accessories",
      title: "Acessórios Xbox",
      display_order: 3,
      is_visible: true,
      section_type: "products",
      sectionConfig: {
        filter: {
          tagIds: ["xbox", "accessories"],
          limit: 6
        }
      },
      pageId: "xbox-page",
      sectionKey: "accessories",
      displayOrder: 3,
      isVisible: true,
      sectionType: "products"
    }
  ],
  "playstation-page": [
    {
      id: "ps-banner-1",
      page_id: "playstation-page",
      section_key: "hero_banner",
      title: "Banner Principal PlayStation",
      display_order: 1,
      is_visible: true,
      section_type: "banner",
      sectionConfig: {
        title: "PlayStation 5",
        subtitle: "Play Has No Limits",
        imageUrl: "/banners/ps-banner.jpg",
        ctaText: "Ver Consoles",
        ctaLink: "/playstation/consoles"
      },
      pageId: "playstation-page",
      sectionKey: "hero_banner",
      displayOrder: 1,
      isVisible: true,
      sectionType: "banner"
    },
    {
      id: "ps-products-1",
      page_id: "playstation-page",
      section_key: "featured_products",
      title: "Produtos em Destaque",
      display_order: 2,
      is_visible: true,
      section_type: "products",
      sectionConfig: {
        filter: {
          tagIds: ["playstation", "featured"],
          limit: 8
        }
      },
      pageId: "playstation-page",
      sectionKey: "featured_products",
      displayOrder: 2,
      isVisible: true,
      sectionType: "products"
    }
  ]
};
