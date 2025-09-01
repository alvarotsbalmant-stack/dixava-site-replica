// Global type fixes to resolve build errors

declare global {
  interface Product {
    image_url?: string;
    platform?: string;
    is_on_sale?: boolean;
  }

  interface SpecialSection {
    section_key?: string;
  }

  interface HTMLStyleElement {
    jsx?: boolean;
  }
}

// Banner type fix
declare module '@/hooks/useBanners' {
  interface Banner {
    device_type: 'desktop' | 'mobile';
    background_type?: string;
  }
}

// Navigation type fix  
declare module '@/hooks/useNavigationItems' {
  interface NavigationItemHook {
    items: any[];
    loading: boolean;
    error: string;
  }
}

export {};