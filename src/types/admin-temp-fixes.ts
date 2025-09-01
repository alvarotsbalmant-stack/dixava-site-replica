// Temporary type fixes for admin components
// This file contains type extensions and fixes to resolve build errors

export interface ExtendedProductSection {
  id: string;
  title: string;
  title_part1?: string;
  title_part2?: string;
  title_color1?: string;
  title_color2?: string;
  view_all_link?: string;
  created_at: string;
  updated_at: string;
  items?: Array<{
    id?: string;
    item_id: string;
    item_type: 'product' | 'banner';
    display_order: number;
  }>;
}

export interface ExtendedProduct {
  id: string;
  name: string;
  image?: string;
  image_url?: string;
  platform?: string;
  is_on_sale?: boolean;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface BannerRowField {
  id: string;
  layout?: string;
  selection_mode?: string;
  product_ids?: string[];
  tag_ids?: string[];
  banners?: any[];
}

// Temporary type assertions for complex components
export const asExtendedProductSection = (section: any): ExtendedProductSection => section as ExtendedProductSection;
export const asExtendedProduct = (product: any): ExtendedProduct => product as ExtendedProduct;
export const asBannerRowField = (field: any): BannerRowField => field as BannerRowField;