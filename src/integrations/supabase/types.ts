export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          background_type: string | null
          button_image_url: string | null
          button_link: string | null
          button_link_desktop: string | null
          button_link_mobile: string | null
          button_text: string | null
          created_at: string
          device_type: string
          display_order: number | null
          gradient: string
          id: string
          image_url: string | null
          image_url_desktop: string | null
          image_url_mobile: string | null
          is_active: boolean
          position: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          background_type?: string | null
          button_image_url?: string | null
          button_link?: string | null
          button_link_desktop?: string | null
          button_link_mobile?: string | null
          button_text?: string | null
          created_at?: string
          device_type?: string
          display_order?: number | null
          gradient?: string
          id?: string
          image_url?: string | null
          image_url_desktop?: string | null
          image_url_mobile?: string | null
          is_active?: boolean
          position?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          background_type?: string | null
          button_image_url?: string | null
          button_link?: string | null
          button_link_desktop?: string | null
          button_link_mobile?: string | null
          button_text?: string | null
          created_at?: string
          device_type?: string
          display_order?: number | null
          gradient?: string
          id?: string
          image_url?: string | null
          image_url_desktop?: string | null
          image_url_mobile?: string | null
          is_active?: boolean
          position?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_abandonment: {
        Row: {
          abandoned_at: string
          cart_items: Json
          cart_value: number
          checkout_step: string | null
          id: string
          recovered: boolean | null
          recovered_at: string | null
          session_id: string
          time_in_checkout_seconds: number | null
          user_id: string | null
        }
        Insert: {
          abandoned_at?: string
          cart_items: Json
          cart_value: number
          checkout_step?: string | null
          id?: string
          recovered?: boolean | null
          recovered_at?: string | null
          session_id: string
          time_in_checkout_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          abandoned_at?: string
          cart_items?: Json
          cart_value?: number
          checkout_step?: string | null
          id?: string
          recovered?: boolean | null
          recovered_at?: string | null
          session_id?: string
          time_in_checkout_seconds?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          product_id: string
          quantity: number
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["product_id"]
          },
        ]
      }
      coin_products: {
        Row: {
          cost: number
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          product_data: Json
          product_type: string
          stock: number | null
          updated_at: string
        }
        Insert: {
          cost: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          product_data?: Json
          product_type: string
          stock?: number | null
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          product_data?: Json
          product_type?: string
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      coin_redemptions: {
        Row: {
          cost: number
          id: string
          notes: string | null
          processed_at: string | null
          product_id: string
          redeemed_at: string
          status: string
          user_id: string
        }
        Insert: {
          cost: number
          id?: string
          notes?: string | null
          processed_at?: string | null
          product_id: string
          redeemed_at?: string
          status?: string
          user_id: string
        }
        Update: {
          cost?: number
          id?: string
          notes?: string | null
          processed_at?: string | null
          product_id?: string
          redeemed_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_redemptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coin_products"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_rules: {
        Row: {
          action: string
          amount: number
          cooldown_minutes: number | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          max_per_day: number | null
          max_per_month: number | null
          updated_at: string
        }
        Insert: {
          action: string
          amount: number
          cooldown_minutes?: number | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          max_per_day?: number | null
          max_per_month?: number | null
          updated_at?: string
        }
        Update: {
          action?: string
          amount?: number
          cooldown_minutes?: number | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          max_per_day?: number | null
          max_per_month?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      coin_system_config: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          reason: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          reason: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          reason?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_data: Json
          event_type: string
          id: string
          ip_address: unknown | null
          location_data: Json | null
          page_url: string | null
          product_id: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_data?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          page_url?: string | null
          product_id?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          page_url?: string | null
          product_id?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_ltv: {
        Row: {
          avg_order_value: number | null
          churn_risk_score: number | null
          first_purchase_date: string | null
          id: string
          last_purchase_date: string | null
          lifetime_value: number | null
          purchase_frequency: number | null
          segment: string | null
          total_purchases: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_order_value?: number | null
          churn_risk_score?: number | null
          first_purchase_date?: string | null
          id?: string
          last_purchase_date?: string | null
          lifetime_value?: number | null
          purchase_frequency?: number | null
          segment?: string | null
          total_purchases?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_order_value?: number | null
          churn_risk_score?: number | null
          first_purchase_date?: string | null
          id?: string
          last_purchase_date?: string | null
          lifetime_value?: number | null
          purchase_frequency?: number | null
          segment?: string | null
          total_purchases?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_actions: {
        Row: {
          action: string
          action_date: string
          count: number
          id: string
          last_performed_at: string
          user_id: string
        }
        Insert: {
          action: string
          action_date?: string
          count?: number
          id?: string
          last_performed_at?: string
          user_id: string
        }
        Update: {
          action?: string
          action_date?: string
          count?: number
          id?: string
          last_performed_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_bonus_codes: {
        Row: {
          bonus_amount: number
          code: string
          created_at: string | null
          expires_at: string
          generated_at: string
          id: string
          is_test_mode: boolean | null
          streak_position: number
        }
        Insert: {
          bonus_amount: number
          code: string
          created_at?: string | null
          expires_at: string
          generated_at: string
          id?: string
          is_test_mode?: boolean | null
          streak_position?: number
        }
        Update: {
          bonus_amount?: number
          code?: string
          created_at?: string | null
          expires_at?: string
          generated_at?: string
          id?: string
          is_test_mode?: boolean | null
          streak_position?: number
        }
        Relationships: []
      }
      daily_bonus_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      daily_codes: {
        Row: {
          claimable_until: string
          code: string
          created_at: string | null
          id: number
          valid_until: string
        }
        Insert: {
          claimable_until: string
          code: string
          created_at?: string | null
          id?: number
          valid_until: string
        }
        Update: {
          claimable_until?: string
          code?: string
          created_at?: string | null
          id?: number
          valid_until?: string
        }
        Relationships: []
      }
      email_config: {
        Row: {
          company_address: string | null
          created_at: string
          from_email: string
          from_name: string
          id: string
          logo_url: string | null
          primary_color: string | null
          reply_to: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          reply_to?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          reply_to?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          text_content: string | null
          type: string
          updated_at: string
          variables: Json | null
          visual_config: Json | null
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          text_content?: string | null
          type: string
          updated_at?: string
          variables?: Json | null
          visual_config?: Json | null
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          text_content?: string | null
          type?: string
          updated_at?: string
          variables?: Json | null
          visual_config?: Json | null
        }
        Relationships: []
      }
      homepage_layout: {
        Row: {
          created_at: string | null
          display_order: number
          id: number
          is_visible: boolean
          section_key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: number
          is_visible?: boolean
          section_key: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: number
          is_visible?: boolean
          section_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mouse_tracking: {
        Row: {
          acceleration: number | null
          coordinates: Json
          created_at: string
          direction_angle: number | null
          heat_zone: string | null
          id: string
          interaction_context: Json | null
          movement_type: string | null
          page_url: string
          pause_duration_ms: number | null
          relative_coordinates: Json | null
          session_id: string
          target_element: string | null
          timestamp_precise: string
          user_id: string | null
          velocity: number | null
          viewport_size: Json
        }
        Insert: {
          acceleration?: number | null
          coordinates: Json
          created_at?: string
          direction_angle?: number | null
          heat_zone?: string | null
          id?: string
          interaction_context?: Json | null
          movement_type?: string | null
          page_url: string
          pause_duration_ms?: number | null
          relative_coordinates?: Json | null
          session_id: string
          target_element?: string | null
          timestamp_precise?: string
          user_id?: string | null
          velocity?: number | null
          viewport_size: Json
        }
        Update: {
          acceleration?: number | null
          coordinates?: Json
          created_at?: string
          direction_angle?: number | null
          heat_zone?: string | null
          id?: string
          interaction_context?: Json | null
          movement_type?: string | null
          page_url?: string
          pause_duration_ms?: number | null
          relative_coordinates?: Json | null
          session_id?: string
          target_element?: string | null
          timestamp_precise?: string
          user_id?: string | null
          velocity?: number | null
          viewport_size?: Json
        }
        Relationships: []
      }
      navigation_flow: {
        Row: {
          from_page: string | null
          id: string
          session_id: string
          time_on_previous_page_seconds: number | null
          to_page: string | null
          transition_time: string
        }
        Insert: {
          from_page?: string | null
          id?: string
          session_id: string
          time_on_previous_page_seconds?: number | null
          to_page?: string | null
          transition_time?: string
        }
        Update: {
          from_page?: string | null
          id?: string
          session_id?: string
          time_on_previous_page_seconds?: number | null
          to_page?: string | null
          transition_time?: string
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          background_color: string | null
          created_at: string | null
          display_order: number
          hover_background_color: string | null
          hover_text_color: string | null
          icon_type: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_visible: boolean | null
          line_animation_duration: number | null
          line_color: string | null
          line_height: number | null
          link_type: string | null
          link_url: string
          show_line: boolean | null
          slug: string
          text_color: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          display_order?: number
          hover_background_color?: string | null
          hover_text_color?: string | null
          icon_type?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          line_animation_duration?: number | null
          line_color?: string | null
          line_height?: number | null
          link_type?: string | null
          link_url: string
          show_line?: boolean | null
          slug: string
          text_color?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          display_order?: number
          hover_background_color?: string | null
          hover_text_color?: string | null
          icon_type?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          line_animation_duration?: number | null
          line_color?: string | null
          line_height?: number | null
          link_type?: string | null
          link_url?: string
          show_line?: boolean | null
          slug?: string
          text_color?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          category: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          link: string
          publish_date: string
          read_time: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          link: string
          publish_date?: string
          read_time?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          link?: string
          publish_date?: string
          read_time?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_verification_codes: {
        Row: {
          browser_info: Json | null
          code: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          customer_info: Json
          discount_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown | null
          items: Json
          rewards_given: Json | null
          rewards_processed: boolean | null
          shipping_info: Json | null
          status: string
          total_amount: number
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          code: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_info: Json
          discount_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          items: Json
          rewards_given?: Json | null
          rewards_processed?: boolean | null
          shipping_info?: Json | null
          status?: string
          total_amount: number
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          code?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_info?: Json
          discount_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          items?: Json
          rewards_given?: Json | null
          rewards_processed?: boolean | null
          shipping_info?: Json | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_interactions: {
        Row: {
          browser_info: Json | null
          context_data: Json | null
          coordinates: Json | null
          created_at: string
          device_type: string | null
          duration_ms: number | null
          element_attributes: Json | null
          element_selector: string | null
          element_text: string | null
          id: string
          interaction_type: string
          page_title: string | null
          page_url: string
          scroll_position: Json | null
          sequence_number: number | null
          session_id: string
          timestamp_precise: string
          user_id: string | null
          viewport_size: Json | null
        }
        Insert: {
          browser_info?: Json | null
          context_data?: Json | null
          coordinates?: Json | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          element_attributes?: Json | null
          element_selector?: string | null
          element_text?: string | null
          id?: string
          interaction_type: string
          page_title?: string | null
          page_url: string
          scroll_position?: Json | null
          sequence_number?: number | null
          session_id: string
          timestamp_precise?: string
          user_id?: string | null
          viewport_size?: Json | null
        }
        Update: {
          browser_info?: Json | null
          context_data?: Json | null
          coordinates?: Json | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          element_attributes?: Json | null
          element_selector?: string | null
          element_text?: string | null
          id?: string
          interaction_type?: string
          page_title?: string | null
          page_url?: string
          scroll_position?: Json | null
          sequence_number?: number | null
          session_id?: string
          timestamp_precise?: string
          user_id?: string | null
          viewport_size?: Json | null
        }
        Relationships: []
      }
      page_layout_items: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          page_id: string
          section_config: Json | null
          section_key: string
          section_type: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          page_id: string
          section_config?: Json | null
          section_key: string
          section_type: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          page_id?: string
          section_config?: Json | null
          section_key?: string
          section_type?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_layout_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          background_color: string | null
          config: Json | null
          created_at: string
          display_order: number
          full_width: boolean | null
          id: string
          is_visible: boolean
          margin: string | null
          padding: string | null
          page_id: string
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          config?: Json | null
          created_at?: string
          display_order?: number
          full_width?: boolean | null
          id?: string
          is_visible?: boolean
          margin?: string | null
          padding?: string | null
          page_id: string
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          config?: Json | null
          created_at?: string
          display_order?: number
          full_width?: boolean | null
          id?: string
          is_visible?: boolean
          margin?: string | null
          padding?: string | null
          page_id?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          description: string | null
          footer_style: string | null
          header_style: string | null
          id: string
          is_active: boolean
          keywords: string[] | null
          layout: string | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          theme: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          footer_style?: string | null
          header_style?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          layout?: string | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          theme?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          footer_style?: string | null
          header_style?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          layout?: string | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          theme?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_vitals: {
        Row: {
          bounce_correlation: boolean | null
          browser_info: Json | null
          connection_type: string | null
          console_errors: Json | null
          conversion_correlation: boolean | null
          created_at: string
          cumulative_layout_shift: number | null
          device_type: string | null
          engagement_impact_score: number | null
          first_contentful_paint: number | null
          first_input_delay: number | null
          id: string
          javascript_errors: Json | null
          largest_contentful_paint: number | null
          measurement_timestamp: string
          navigation_timing: Json | null
          network_errors: Json | null
          network_information: Json | null
          page_load_complete: string | null
          page_load_start: string | null
          page_url: string
          performance_score: number | null
          resource_timing: Json | null
          session_id: string
          time_to_interactive: number | null
          total_blocking_time: number | null
          user_experience_score: number | null
          user_id: string | null
          viewport_size: Json | null
        }
        Insert: {
          bounce_correlation?: boolean | null
          browser_info?: Json | null
          connection_type?: string | null
          console_errors?: Json | null
          conversion_correlation?: boolean | null
          created_at?: string
          cumulative_layout_shift?: number | null
          device_type?: string | null
          engagement_impact_score?: number | null
          first_contentful_paint?: number | null
          first_input_delay?: number | null
          id?: string
          javascript_errors?: Json | null
          largest_contentful_paint?: number | null
          measurement_timestamp?: string
          navigation_timing?: Json | null
          network_errors?: Json | null
          network_information?: Json | null
          page_load_complete?: string | null
          page_load_start?: string | null
          page_url: string
          performance_score?: number | null
          resource_timing?: Json | null
          session_id: string
          time_to_interactive?: number | null
          total_blocking_time?: number | null
          user_experience_score?: number | null
          user_id?: string | null
          viewport_size?: Json | null
        }
        Update: {
          bounce_correlation?: boolean | null
          browser_info?: Json | null
          connection_type?: string | null
          console_errors?: Json | null
          conversion_correlation?: boolean | null
          created_at?: string
          cumulative_layout_shift?: number | null
          device_type?: string | null
          engagement_impact_score?: number | null
          first_contentful_paint?: number | null
          first_input_delay?: number | null
          id?: string
          javascript_errors?: Json | null
          largest_contentful_paint?: number | null
          measurement_timestamp?: string
          navigation_timing?: Json | null
          network_errors?: Json | null
          network_information?: Json | null
          page_load_complete?: string | null
          page_load_start?: string | null
          page_url?: string
          performance_score?: number | null
          resource_timing?: Json | null
          session_id?: string
          time_to_interactive?: number | null
          total_blocking_time?: number | null
          user_experience_score?: number | null
          user_id?: string | null
          viewport_size?: Json | null
        }
        Relationships: []
      }
      period_analytics: {
        Row: {
          avg_order_value: number | null
          avg_session_duration: number | null
          bounce_rate: number | null
          cart_abandonment_rate: number | null
          conversion_rate: number | null
          date: string
          id: string
          new_visitors: number | null
          returning_visitors: number | null
          total_events: number | null
          total_page_views: number | null
          total_purchases: number | null
          total_revenue: number | null
          total_sessions: number | null
          unique_visitors: number | null
          updated_at: string
          whatsapp_clicks: number | null
          whatsapp_conversions: number | null
        }
        Insert: {
          avg_order_value?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          cart_abandonment_rate?: number | null
          conversion_rate?: number | null
          date: string
          id?: string
          new_visitors?: number | null
          returning_visitors?: number | null
          total_events?: number | null
          total_page_views?: number | null
          total_purchases?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          unique_visitors?: number | null
          updated_at?: string
          whatsapp_clicks?: number | null
          whatsapp_conversions?: number | null
        }
        Update: {
          avg_order_value?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          cart_abandonment_rate?: number | null
          conversion_rate?: number | null
          date?: string
          id?: string
          new_visitors?: number | null
          returning_visitors?: number | null
          total_events?: number | null
          total_page_views?: number | null
          total_purchases?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          unique_visitors?: number | null
          updated_at?: string
          whatsapp_clicks?: number | null
          whatsapp_conversions?: number | null
        }
        Relationships: []
      }
      platforms: {
        Row: {
          color: string | null
          created_at: string
          display_order: number | null
          icon_emoji: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      prime_page_layout: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_visible: boolean | null
          page_id: string | null
          section_config: Json | null
          section_key: string
          section_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean | null
          page_id?: string | null
          section_config?: Json | null
          section_key: string
          section_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean | null
          page_id?: string | null
          section_config?: Json | null
          section_key?: string
          section_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prime_page_layout_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "prime_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      prime_pages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pro_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          duration_months: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          duration_months: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          duration_months?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      product_affinity: {
        Row: {
          affinity_score: number | null
          co_purchase_count: number | null
          co_view_count: number | null
          id: string
          last_updated: string
          product_a_id: string
          product_b_id: string
        }
        Insert: {
          affinity_score?: number | null
          co_purchase_count?: number | null
          co_view_count?: number | null
          id?: string
          last_updated?: string
          product_a_id: string
          product_b_id: string
        }
        Update: {
          affinity_score?: number | null
          co_purchase_count?: number | null
          co_view_count?: number | null
          id?: string
          last_updated?: string
          product_a_id?: string
          product_b_id?: string
        }
        Relationships: []
      }
      product_analytics: {
        Row: {
          add_to_cart_count: number | null
          cart_abandonment_rate: number | null
          checkout_starts: number | null
          conversion_rate: number | null
          date: string
          id: string
          product_id: string
          purchase_value: number | null
          purchases_count: number | null
          remove_from_cart_count: number | null
          unique_views: number | null
          updated_at: string
          views_count: number | null
          whatsapp_clicks: number | null
          whatsapp_conversions: number | null
        }
        Insert: {
          add_to_cart_count?: number | null
          cart_abandonment_rate?: number | null
          checkout_starts?: number | null
          conversion_rate?: number | null
          date: string
          id?: string
          product_id: string
          purchase_value?: number | null
          purchases_count?: number | null
          remove_from_cart_count?: number | null
          unique_views?: number | null
          updated_at?: string
          views_count?: number | null
          whatsapp_clicks?: number | null
          whatsapp_conversions?: number | null
        }
        Update: {
          add_to_cart_count?: number | null
          cart_abandonment_rate?: number | null
          checkout_starts?: number | null
          conversion_rate?: number | null
          date?: string
          id?: string
          product_id?: string
          purchase_value?: number | null
          purchases_count?: number | null
          remove_from_cart_count?: number | null
          unique_views?: number | null
          updated_at?: string
          views_count?: number | null
          whatsapp_clicks?: number | null
          whatsapp_conversions?: number | null
        }
        Relationships: []
      }
      product_faqs: {
        Row: {
          active: boolean | null
          answer: string
          category: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          order_index: number | null
          product_id: string | null
          question: string
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          answer: string
          category?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          order_index?: number | null
          product_id?: string | null
          question: string
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          answer?: string
          category?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          order_index?: number | null
          product_id?: string | null
          question?: string
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_section_items: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: number
          item_id: string
          item_type: Database["public"]["Enums"]["section_item_type"]
          section_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          item_id: string
          item_type: Database["public"]["Enums"]["section_item_type"]
          section_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          item_id?: string
          item_type?: Database["public"]["Enums"]["section_item_type"]
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_section_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "product_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sections: {
        Row: {
          created_at: string | null
          id: string
          page_id: string | null
          title: string
          title_color1: string | null
          title_color2: string | null
          title_part1: string | null
          title_part2: string | null
          updated_at: string | null
          view_all_link: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_id?: string | null
          title: string
          title_color1?: string | null
          title_color2?: string | null
          title_part1?: string | null
          title_part2?: string | null
          updated_at?: string | null
          view_all_link?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page_id?: string | null
          title?: string
          title_color1?: string | null
          title_color2?: string | null
          title_part1?: string | null
          title_part2?: string | null
          updated_at?: string | null
          view_all_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sections_page_id_fk"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "prime_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          category: string
          created_at: string | null
          highlight: boolean | null
          icon: string | null
          id: string
          label: string
          order_index: number | null
          product_id: string | null
          updated_at: string | null
          value: string
        }
        Insert: {
          category: string
          created_at?: string | null
          highlight?: boolean | null
          icon?: string | null
          id?: string
          label: string
          order_index?: number | null
          product_id?: string | null
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string
          created_at?: string | null
          highlight?: boolean | null
          icon?: string | null
          id?: string
          label?: string
          order_index?: number | null
          product_id?: string | null
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          id: string
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_tags_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_product_tags_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_product_tags_tag_id"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_product_tags_tag_id"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      products: {
        Row: {
          additional_images: string[] | null
          available_variants: Json | null
          badge_color: string | null
          badge_text: string | null
          badge_visible: boolean | null
          brand: string | null
          breadcrumb_config: Json | null
          category: string | null
          colors: string[] | null
          condition: string | null
          created_at: string
          delivery_config: Json | null
          description: string | null
          digital_price: number | null
          discount_percentage: number | null
          discount_price: number | null
          display_config: Json | null
          free_shipping: boolean | null
          id: string
          image: string | null
          images: string[] | null
          inherit_from_master: Json | null
          installment_options: number | null
          is_active: boolean | null
          is_featured: boolean | null
          is_master_product: boolean | null
          list_price: number | null
          manual_related_products: Json | null
          master_slug: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          new_price: number | null
          parent_product_id: string | null
          pix_discount_percentage: number | null
          platform: string | null
          price: number
          pro_discount_percent: number | null
          pro_price: number | null
          product_descriptions: Json | null
          product_faqs: Json | null
          product_features: Json | null
          product_highlights: Json | null
          product_type: string | null
          product_videos: Json | null
          promotional_price: number | null
          rating: number | null
          rating_average: number | null
          rating_count: number | null
          related_products: Json | null
          related_products_auto: boolean | null
          reviews_config: Json | null
          reviews_enabled: boolean | null
          shipping_dimensions: Json | null
          shipping_time_max: number | null
          shipping_time_min: number | null
          shipping_weight: number | null
          show_rating: boolean | null
          show_stock: boolean | null
          sizes: string[] | null
          sku_code: string | null
          slug: string | null
          sort_order: number | null
          specifications: Json | null
          stock: number | null
          store_pickup_available: boolean | null
          technical_specs: Json | null
          title: string | null
          trust_indicators: Json | null
          updated_at: string
          uti_coins_cashback_percentage: number | null
          uti_pro_custom_price: number | null
          uti_pro_enabled: boolean | null
          uti_pro_price: number | null
          uti_pro_type: string | null
          uti_pro_value: number | null
          variant_attributes: Json | null
        }
        Insert: {
          additional_images?: string[] | null
          available_variants?: Json | null
          badge_color?: string | null
          badge_text?: string | null
          badge_visible?: boolean | null
          brand?: string | null
          breadcrumb_config?: Json | null
          category?: string | null
          colors?: string[] | null
          condition?: string | null
          created_at?: string
          delivery_config?: Json | null
          description?: string | null
          digital_price?: number | null
          discount_percentage?: number | null
          discount_price?: number | null
          display_config?: Json | null
          free_shipping?: boolean | null
          id?: string
          image?: string | null
          images?: string[] | null
          inherit_from_master?: Json | null
          installment_options?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_master_product?: boolean | null
          list_price?: number | null
          manual_related_products?: Json | null
          master_slug?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          new_price?: number | null
          parent_product_id?: string | null
          pix_discount_percentage?: number | null
          platform?: string | null
          price: number
          pro_discount_percent?: number | null
          pro_price?: number | null
          product_descriptions?: Json | null
          product_faqs?: Json | null
          product_features?: Json | null
          product_highlights?: Json | null
          product_type?: string | null
          product_videos?: Json | null
          promotional_price?: number | null
          rating?: number | null
          rating_average?: number | null
          rating_count?: number | null
          related_products?: Json | null
          related_products_auto?: boolean | null
          reviews_config?: Json | null
          reviews_enabled?: boolean | null
          shipping_dimensions?: Json | null
          shipping_time_max?: number | null
          shipping_time_min?: number | null
          shipping_weight?: number | null
          show_rating?: boolean | null
          show_stock?: boolean | null
          sizes?: string[] | null
          sku_code?: string | null
          slug?: string | null
          sort_order?: number | null
          specifications?: Json | null
          stock?: number | null
          store_pickup_available?: boolean | null
          technical_specs?: Json | null
          title?: string | null
          trust_indicators?: Json | null
          updated_at?: string
          uti_coins_cashback_percentage?: number | null
          uti_pro_custom_price?: number | null
          uti_pro_enabled?: boolean | null
          uti_pro_price?: number | null
          uti_pro_type?: string | null
          uti_pro_value?: number | null
          variant_attributes?: Json | null
        }
        Update: {
          additional_images?: string[] | null
          available_variants?: Json | null
          badge_color?: string | null
          badge_text?: string | null
          badge_visible?: boolean | null
          brand?: string | null
          breadcrumb_config?: Json | null
          category?: string | null
          colors?: string[] | null
          condition?: string | null
          created_at?: string
          delivery_config?: Json | null
          description?: string | null
          digital_price?: number | null
          discount_percentage?: number | null
          discount_price?: number | null
          display_config?: Json | null
          free_shipping?: boolean | null
          id?: string
          image?: string | null
          images?: string[] | null
          inherit_from_master?: Json | null
          installment_options?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_master_product?: boolean | null
          list_price?: number | null
          manual_related_products?: Json | null
          master_slug?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          new_price?: number | null
          parent_product_id?: string | null
          pix_discount_percentage?: number | null
          platform?: string | null
          price?: number
          pro_discount_percent?: number | null
          pro_price?: number | null
          product_descriptions?: Json | null
          product_faqs?: Json | null
          product_features?: Json | null
          product_highlights?: Json | null
          product_type?: string | null
          product_videos?: Json | null
          promotional_price?: number | null
          rating?: number | null
          rating_average?: number | null
          rating_count?: number | null
          related_products?: Json | null
          related_products_auto?: boolean | null
          reviews_config?: Json | null
          reviews_enabled?: boolean | null
          shipping_dimensions?: Json | null
          shipping_time_max?: number | null
          shipping_time_min?: number | null
          shipping_weight?: number | null
          show_rating?: boolean | null
          show_stock?: boolean | null
          sizes?: string[] | null
          sku_code?: string | null
          slug?: string | null
          sort_order?: number | null
          specifications?: Json | null
          stock?: number | null
          store_pickup_available?: boolean | null
          technical_specs?: Json | null
          title?: string | null
          trust_indicators?: Json | null
          updated_at?: string
          uti_coins_cashback_percentage?: number | null
          uti_pro_custom_price?: number | null
          uti_pro_enabled?: boolean | null
          uti_pro_price?: number | null
          uti_pro_type?: string | null
          uti_pro_value?: number | null
          variant_attributes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["product_id"]
          },
        ]
      }
      promotional_ribbon_config: {
        Row: {
          background_color: string | null
          background_type: string | null
          created_at: string | null
          device_type: string
          gradient_colors: string | null
          id: string
          is_active: boolean | null
          link_url: string | null
          text: string
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          background_type?: string | null
          created_at?: string | null
          device_type: string
          gradient_colors?: string | null
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          text?: string
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          background_type?: string | null
          created_at?: string | null
          device_type?: string
          gradient_colors?: string | null
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          text?: string
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quick_links: {
        Row: {
          created_at: string
          icon_url: string
          id: string
          is_active: boolean
          label: string
          path: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_url: string
          id?: string
          is_active?: boolean
          label: string
          path: string
          position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_url?: string
          id?: string
          is_active?: boolean
          label?: string
          path?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      realtime_activity: {
        Row: {
          activity_status: string
          browser_info: Json | null
          cart_status: Json | null
          churn_risk_score: number | null
          conversion_probability: number | null
          created_at: string
          current_page_start_time: string
          current_page_title: string | null
          current_page_url: string
          current_product_viewing: string | null
          device_type: string | null
          engagement_score: number | null
          id: string
          idle_time_seconds: number | null
          interactions_count: number | null
          intervention_opportunity: boolean | null
          last_heartbeat: string
          location_data: Json | null
          predicted_intent: string | null
          recommended_action: string | null
          scroll_depth_percentage: number | null
          search_context: Json | null
          session_id: string
          session_start_time: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activity_status: string
          browser_info?: Json | null
          cart_status?: Json | null
          churn_risk_score?: number | null
          conversion_probability?: number | null
          created_at?: string
          current_page_start_time: string
          current_page_title?: string | null
          current_page_url: string
          current_product_viewing?: string | null
          device_type?: string | null
          engagement_score?: number | null
          id?: string
          idle_time_seconds?: number | null
          interactions_count?: number | null
          intervention_opportunity?: boolean | null
          last_heartbeat?: string
          location_data?: Json | null
          predicted_intent?: string | null
          recommended_action?: string | null
          scroll_depth_percentage?: number | null
          search_context?: Json | null
          session_id: string
          session_start_time: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activity_status?: string
          browser_info?: Json | null
          cart_status?: Json | null
          churn_risk_score?: number | null
          conversion_probability?: number | null
          created_at?: string
          current_page_start_time?: string
          current_page_title?: string | null
          current_page_url?: string
          current_product_viewing?: string | null
          device_type?: string | null
          engagement_score?: number | null
          id?: string
          idle_time_seconds?: number | null
          interactions_count?: number | null
          intervention_opportunity?: boolean | null
          last_heartbeat?: string
          location_data?: Json | null
          predicted_intent?: string | null
          recommended_action?: string | null
          scroll_depth_percentage?: number | null
          search_context?: Json | null
          session_id?: string
          session_start_time?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      realtime_dashboard_cache: {
        Row: {
          id: string
          last_updated: string | null
          metric_data: Json | null
          metric_type: string
          metric_value: number | null
          period_end: string | null
          period_start: string | null
        }
        Insert: {
          id?: string
          last_updated?: string | null
          metric_data?: Json | null
          metric_type: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
        }
        Update: {
          id?: string
          last_updated?: string | null
          metric_data?: Json | null
          metric_type?: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
        }
        Relationships: []
      }
      redemption_codes: {
        Row: {
          code: string
          cost: number
          created_at: string
          id: string
          product_id: string
          redeemed_at: string | null
          redeemed_by_admin: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          cost: number
          created_at?: string
          id?: string
          product_id: string
          redeemed_at?: string | null
          redeemed_by_admin?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          cost?: number
          created_at?: string
          id?: string
          product_id?: string
          redeemed_at?: string | null
          redeemed_by_admin?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coin_products"
            referencedColumns: ["id"]
          },
        ]
      }
      scroll_behavior: {
        Row: {
          created_at: string | null
          device_type: string | null
          engagement_per_section: Json | null
          exit_scroll_depth: number | null
          id: string
          max_scroll_reached: number | null
          page_url: string
          scroll_depth_percentage: number | null
          scroll_depth_pixels: number | null
          scroll_direction: string | null
          scroll_pattern: string | null
          scroll_pauses_count: number | null
          scroll_velocity: number | null
          sections_viewed: Json | null
          session_id: string
          time_to_scroll_seconds: number | null
          timestamp_precise: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          engagement_per_section?: Json | null
          exit_scroll_depth?: number | null
          id?: string
          max_scroll_reached?: number | null
          page_url: string
          scroll_depth_percentage?: number | null
          scroll_depth_pixels?: number | null
          scroll_direction?: string | null
          scroll_pattern?: string | null
          scroll_pauses_count?: number | null
          scroll_velocity?: number | null
          sections_viewed?: Json | null
          session_id: string
          time_to_scroll_seconds?: number | null
          timestamp_precise?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          engagement_per_section?: Json | null
          exit_scroll_depth?: number | null
          id?: string
          max_scroll_reached?: number | null
          page_url?: string
          scroll_depth_percentage?: number | null
          scroll_depth_pixels?: number | null
          scroll_direction?: string | null
          scroll_pattern?: string | null
          scroll_pauses_count?: number | null
          scroll_velocity?: number | null
          sections_viewed?: Json | null
          session_id?: string
          time_to_scroll_seconds?: number | null
          timestamp_precise?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_flags: {
        Row: {
          created_at: string
          flag_type: string
          id: string
          metadata: Json | null
          reason: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flag_type: string
          id?: string
          metadata?: Json | null
          reason: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flag_type?: string
          id?: string
          metadata?: Json | null
          reason?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          suspicious: boolean | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          suspicious?: boolean | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          suspicious?: boolean | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_cards: {
        Row: {
          background_image_url: string | null
          created_at: string
          description: string
          icon_filter_enabled: boolean | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string
          position: number
          shadow_color: string | null
          shadow_enabled: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          description: string
          icon_filter_enabled?: boolean | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url: string
          position?: number
          shadow_color?: string | null
          shadow_enabled?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          description?: string
          icon_filter_enabled?: boolean | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string
          position?: number
          shadow_color?: string | null
          shadow_enabled?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          header_image_url: string | null
          header_layout_type: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          header_image_url?: string | null
          header_layout_type?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          header_image_url?: string | null
          header_layout_type?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      special_section_elements: {
        Row: {
          background_color: string | null
          background_gradient: string | null
          background_image_url: string | null
          background_type: string | null
          border_radius: number | null
          button_color: string | null
          button_text_color: string | null
          content_ids: Json | null
          content_type: string | null
          created_at: string | null
          display_order: number | null
          element_type: string
          grid_position: string | null
          grid_size: string | null
          height_desktop: number | null
          height_mobile: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_text: string | null
          link_url: string | null
          margin_bottom: number | null
          mobile_settings: Json | null
          padding: number | null
          special_section_id: string | null
          subtitle: string | null
          text_color: string | null
          title: string | null
          updated_at: string | null
          visible_items_desktop: number | null
          visible_items_mobile: number | null
          visible_items_tablet: number | null
          width_percentage: number | null
        }
        Insert: {
          background_color?: string | null
          background_gradient?: string | null
          background_image_url?: string | null
          background_type?: string | null
          border_radius?: number | null
          button_color?: string | null
          button_text_color?: string | null
          content_ids?: Json | null
          content_type?: string | null
          created_at?: string | null
          display_order?: number | null
          element_type: string
          grid_position?: string | null
          grid_size?: string | null
          height_desktop?: number | null
          height_mobile?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          margin_bottom?: number | null
          mobile_settings?: Json | null
          padding?: number | null
          special_section_id?: string | null
          subtitle?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string | null
          visible_items_desktop?: number | null
          visible_items_mobile?: number | null
          visible_items_tablet?: number | null
          width_percentage?: number | null
        }
        Update: {
          background_color?: string | null
          background_gradient?: string | null
          background_image_url?: string | null
          background_type?: string | null
          border_radius?: number | null
          button_color?: string | null
          button_text_color?: string | null
          content_ids?: Json | null
          content_type?: string | null
          created_at?: string | null
          display_order?: number | null
          element_type?: string
          grid_position?: string | null
          grid_size?: string | null
          height_desktop?: number | null
          height_mobile?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          margin_bottom?: number | null
          mobile_settings?: Json | null
          padding?: number | null
          special_section_id?: string | null
          subtitle?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string | null
          visible_items_desktop?: number | null
          visible_items_mobile?: number | null
          visible_items_tablet?: number | null
          width_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "special_section_elements_special_section_id_fkey"
            columns: ["special_section_id"]
            isOneToOne: false
            referencedRelation: "special_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      special_section_grid_layouts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          layout_structure: Json
          name: string
          preview_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_structure: Json
          name: string
          preview_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_structure?: Json
          name?: string
          preview_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      special_sections: {
        Row: {
          background_color: string | null
          background_gradient: string | null
          background_image_crop_data: Json | null
          background_image_position: string | null
          background_image_url: string | null
          background_type: string
          background_value: string | null
          border_radius: number | null
          carousel_title_color: string | null
          content_config: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          margin_bottom: number | null
          margin_top: number | null
          mobile_settings: Json | null
          padding_bottom: number | null
          padding_left: number | null
          padding_right: number | null
          padding_top: number | null
          page_id: string | null
          scrollbar_color: string | null
          scrollbar_hover_color: string | null
          title: string
          title_color1: string | null
          title_color2: string | null
          title_part1: string | null
          title_part2: string | null
          updated_at: string | null
          view_all_button_bg_color: string | null
          view_all_button_text_color: string | null
        }
        Insert: {
          background_color?: string | null
          background_gradient?: string | null
          background_image_crop_data?: Json | null
          background_image_position?: string | null
          background_image_url?: string | null
          background_type?: string
          background_value?: string | null
          border_radius?: number | null
          carousel_title_color?: string | null
          content_config?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          margin_bottom?: number | null
          margin_top?: number | null
          mobile_settings?: Json | null
          padding_bottom?: number | null
          padding_left?: number | null
          padding_right?: number | null
          padding_top?: number | null
          page_id?: string | null
          scrollbar_color?: string | null
          scrollbar_hover_color?: string | null
          title: string
          title_color1?: string | null
          title_color2?: string | null
          title_part1?: string | null
          title_part2?: string | null
          updated_at?: string | null
          view_all_button_bg_color?: string | null
          view_all_button_text_color?: string | null
        }
        Update: {
          background_color?: string | null
          background_gradient?: string | null
          background_image_crop_data?: Json | null
          background_image_position?: string | null
          background_image_url?: string | null
          background_type?: string
          background_value?: string | null
          border_radius?: number | null
          carousel_title_color?: string | null
          content_config?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          margin_bottom?: number | null
          margin_top?: number | null
          mobile_settings?: Json | null
          padding_bottom?: number | null
          padding_left?: number | null
          padding_right?: number | null
          padding_top?: number | null
          page_id?: string | null
          scrollbar_color?: string | null
          scrollbar_hover_color?: string | null
          title?: string
          title_color1?: string | null
          title_color2?: string | null
          title_part1?: string | null
          title_part2?: string | null
          updated_at?: string | null
          view_all_button_bg_color?: string | null
          view_all_button_text_color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "special_sections_page_id_fk"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "prime_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      specification_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      specification_template_items: {
        Row: {
          category_name: string
          created_at: string | null
          default_value: string | null
          highlight: boolean | null
          id: string
          is_required: boolean | null
          label: string
          order_index: number | null
          template_id: string | null
          validation_rules: Json | null
        }
        Insert: {
          category_name: string
          created_at?: string | null
          default_value?: string | null
          highlight?: boolean | null
          id?: string
          is_required?: boolean | null
          label: string
          order_index?: number | null
          template_id?: string | null
          validation_rules?: Json | null
        }
        Update: {
          category_name?: string
          created_at?: string | null
          default_value?: string | null
          highlight?: boolean | null
          id?: string
          is_required?: boolean | null
          label?: string
          order_index?: number | null
          template_id?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "specification_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "specification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      specification_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          label: string
          name: string
          product_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          name: string
          product_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          name?: string
          product_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      storage_stats_backup: {
        Row: {
          created_at: string | null
          id: string | null
          last_scan: string | null
          non_webp_images: number | null
          total_images: number | null
          total_size_mb: number | null
          updated_at: string | null
          webp_images: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          last_scan?: string | null
          non_webp_images?: number | null
          total_images?: number | null
          total_size_mb?: number | null
          updated_at?: string | null
          webp_images?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          last_scan?: string | null
          non_webp_images?: number | null
          total_images?: number | null
          total_size_mb?: number | null
          updated_at?: string | null
          webp_images?: number | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number
          duration_months: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          duration_months: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          duration_months?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_data: Json | null
          alert_type: string
          created_at: string
          id: string
          message: string
          page_url: string | null
          resolved: boolean | null
          resolved_at: string | null
          session_id: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_data?: Json | null
          alert_type: string
          created_at?: string
          id?: string
          message: string
          page_url?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          session_id?: string | null
          severity: string
          user_id?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_data?: Json | null
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          page_url?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          session_id?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      top_deal_items: {
        Row: {
          created_at: string | null
          deal_label: string
          display_order: number | null
          id: number
          product_id: string
          section_id: string | null
        }
        Insert: {
          created_at?: string | null
          deal_label: string
          display_order?: number | null
          id?: number
          product_id: string
          section_id?: string | null
        }
        Update: {
          created_at?: string | null
          deal_label?: string
          display_order?: number | null
          id?: number
          product_id?: string
          section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "top_deal_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "top_deal_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      top_deal_sections: {
        Row: {
          banner_button_link: string | null
          banner_button_text: string | null
          banner_image_url: string | null
          banner_subtitle: string | null
          banner_title: string | null
          created_at: string | null
          id: string
          is_pro_exclusive: boolean | null
          subtitle: string | null
          title: string
          updated_at: string | null
          view_all_link: string | null
        }
        Insert: {
          banner_button_link?: string | null
          banner_button_text?: string | null
          banner_image_url?: string | null
          banner_subtitle?: string | null
          banner_title?: string | null
          created_at?: string | null
          id?: string
          is_pro_exclusive?: boolean | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          view_all_link?: string | null
        }
        Update: {
          banner_button_link?: string | null
          banner_button_text?: string | null
          banner_image_url?: string | null
          banner_subtitle?: string | null
          banner_title?: string | null
          created_at?: string | null
          id?: string
          is_pro_exclusive?: boolean | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          view_all_link?: string | null
        }
        Relationships: []
      }
      user_bonus_claims: {
        Row: {
          bonus_received: number
          claimed_at: string | null
          code_id: string | null
          id: string
          streak_at_claim: number
          user_id: string
        }
        Insert: {
          bonus_received: number
          claimed_at?: string | null
          code_id?: string | null
          id?: string
          streak_at_claim: number
          user_id: string
        }
        Update: {
          bonus_received?: number
          claimed_at?: string | null
          code_id?: string | null
          id?: string
          streak_at_claim?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bonus_claims_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "daily_bonus_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_codes: {
        Row: {
          added_at: string | null
          code: string
          expires_at: string
          id: number
          is_valid: boolean | null
          streak_position: number
          user_id: string
        }
        Insert: {
          added_at?: string | null
          code: string
          expires_at: string
          id?: number
          is_valid?: boolean | null
          streak_position: number
          user_id: string
        }
        Update: {
          added_at?: string | null
          code?: string
          expires_at?: string
          id?: number
          is_valid?: boolean | null
          streak_position?: number
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["product_id"]
          },
        ]
      }
      user_journey_detailed: {
        Row: {
          action_details: Json | null
          action_type: string
          conversion_probability: number | null
          conversion_step: boolean | null
          created_at: string
          cumulative_time_seconds: number | null
          element_interacted: string | null
          engagement_score: number | null
          exit_point: boolean | null
          friction_detected: boolean | null
          friction_type: string | null
          funnel_stage: string | null
          id: string
          page_title: string | null
          page_url: string
          predicted_next_action: string | null
          previous_page_url: string | null
          session_id: string
          step_end_time: string | null
          step_number: number
          step_start_time: string
          time_spent_seconds: number | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          conversion_probability?: number | null
          conversion_step?: boolean | null
          created_at?: string
          cumulative_time_seconds?: number | null
          element_interacted?: string | null
          engagement_score?: number | null
          exit_point?: boolean | null
          friction_detected?: boolean | null
          friction_type?: string | null
          funnel_stage?: string | null
          id?: string
          page_title?: string | null
          page_url: string
          predicted_next_action?: string | null
          previous_page_url?: string | null
          session_id: string
          step_end_time?: string | null
          step_number: number
          step_start_time: string
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          conversion_probability?: number | null
          conversion_step?: boolean | null
          created_at?: string
          cumulative_time_seconds?: number | null
          element_interacted?: string | null
          engagement_score?: number | null
          exit_point?: boolean | null
          friction_detected?: boolean | null
          friction_type?: string | null
          funnel_stage?: string | null
          id?: string
          page_title?: string | null
          page_url?: string
          predicted_next_action?: string | null
          previous_page_url?: string | null
          session_id?: string
          step_end_time?: string | null
          step_number?: number
          step_start_time?: string
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_savings: {
        Row: {
          created_at: string | null
          id: string
          original_price: number
          paid_price: number
          product_id: string
          purchase_date: string | null
          savings_amount: number
          savings_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_price: number
          paid_price: number
          product_id: string
          purchase_date?: string | null
          savings_amount: number
          savings_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          original_price?: number
          paid_price?: number
          product_id?: string
          purchase_date?: string | null
          savings_amount?: number
          savings_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_savings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_savings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["product_id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          browser: string | null
          converted: boolean | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          events_count: number | null
          id: string
          location_data: Json | null
          os: string | null
          page_views: number | null
          purchase_value: number | null
          session_id: string
          started_at: string
          traffic_source: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          converted?: boolean | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          events_count?: number | null
          id?: string
          location_data?: Json | null
          os?: string | null
          page_views?: number | null
          purchase_value?: number | null
          session_id: string
          started_at?: string
          traffic_source?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          converted?: boolean | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          events_count?: number | null
          id?: string
          location_data?: Json | null
          os?: string | null
          page_views?: number | null
          purchase_value?: number | null
          session_id?: string
          started_at?: string
          traffic_source?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_login_date: string | null
          longest_streak: number
          streak_multiplier: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_login_date?: string | null
          longest_streak?: number
          streak_multiplier?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_login_date?: string | null
          longest_streak?: number
          streak_multiplier?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          plan_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          plan_id: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_subscriptions_plan_id"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nome?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      uti_coins: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_category_performance: {
        Row: {
          avg_engagement: number | null
          avg_time_spent: number | null
          category: string | null
          conversion_rate: number | null
          converted_sessions: number | null
          friction_incidents: number | null
          total_revenue: number | null
          total_sessions: number | null
        }
        Relationships: []
      }
      mv_hourly_metrics: {
        Row: {
          avg_engagement: number | null
          conversion_rate: number | null
          hour: string | null
          page_url: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_hovers: number | null
          total_interactions: number | null
          total_revenue: number | null
          total_scrolls: number | null
          unique_sessions: number | null
        }
        Relationships: []
      }
      view_homepage_layout_complete: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: number | null
          is_visible: boolean | null
          product_section_title: string | null
          product_section_title_color1: string | null
          product_section_title_color2: string | null
          product_section_title_part1: string | null
          product_section_title_part2: string | null
          product_section_view_all_link: string | null
          section_key: string | null
          special_section_background_color: string | null
          special_section_content_config: Json | null
          special_section_display_order: number | null
          special_section_is_active: boolean | null
          special_section_title: string | null
          special_section_title_color1: string | null
          special_section_title_color2: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      view_product_with_tags: {
        Row: {
          additional_images: string[] | null
          available_variants: Json | null
          badge_color: string | null
          badge_text: string | null
          badge_visible: boolean | null
          brand: string | null
          breadcrumb_config: Json | null
          category: string | null
          colors: string[] | null
          condition: string | null
          created_at: string | null
          delivery_config: Json | null
          digital_price: number | null
          discount_percentage: number | null
          discount_price: number | null
          display_config: Json | null
          free_shipping: boolean | null
          inherit_from_master: Json | null
          installment_options: number | null
          is_active: boolean | null
          is_featured: boolean | null
          is_master_product: boolean | null
          list_price: number | null
          manual_related_products: Json | null
          master_slug: string | null
          meta_description: string | null
          meta_title: string | null
          new_price: number | null
          parent_product_id: string | null
          pix_discount_percentage: number | null
          platform: string | null
          pro_discount_percent: number | null
          pro_price: number | null
          product_description: string | null
          product_descriptions: Json | null
          product_faqs: Json | null
          product_features: Json | null
          product_highlights: Json | null
          product_id: string | null
          product_image: string | null
          product_name: string | null
          product_price: number | null
          product_stock: number | null
          product_type: string | null
          product_videos: Json | null
          promotional_price: number | null
          rating_average: number | null
          rating_count: number | null
          reviews_config: Json | null
          shipping_weight: number | null
          sizes: string[] | null
          sku_code: string | null
          slug: string | null
          sort_order: number | null
          specifications: Json | null
          tag_id: string | null
          tag_name: string | null
          technical_specs: Json | null
          trust_indicators: Json | null
          updated_at: string | null
          uti_pro_custom_price: number | null
          uti_pro_enabled: boolean | null
          uti_pro_price: number | null
          uti_pro_type: string | null
          uti_pro_value: number | null
          variant_attributes: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_tags"
            referencedColumns: ["product_id"]
          },
        ]
      }
    }
    Functions: {
      adicionar_meses_assinatura: {
        Args: { meses: number; user_id: string }
        Returns: boolean
      }
      analyze_index_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_name: string
          index_scans: number
          table_name: string
          tuples_fetched: number
          tuples_read: number
        }[]
      }
      calculate_engagement_score: {
        Args: { p_page_url?: string; p_session_id: string }
        Returns: number
      }
      can_claim_code: {
        Args: { p_code: string }
        Returns: boolean
      }
      can_claim_daily_bonus_brasilia: {
        Args: { p_user_id: string }
        Returns: {
          can_claim: boolean
          last_claim: string
          next_reset: string
          period_end: string
          period_start: string
        }[]
      }
      can_claim_daily_bonus_test: {
        Args: { p_user_id: string }
        Returns: {
          can_claim: boolean
          last_claim: string
          next_reset: string
          period_end: string
          period_start: string
        }[]
      }
      cancelar_assinatura: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_email_confirmation_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          email_confirmed_at: string
          is_confirmed: boolean
          user_id: string
        }[]
      }
      check_suspicious_activity: {
        Args: { p_action: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_analytics_data: {
        Args: { p_retention_days?: number }
        Returns: Json
      }
      cleanup_old_bonus_codes: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_daily_codes: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_invalidated_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_security_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_uti_coins_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_order_verification: {
        Args: { p_admin_id: string; p_code: string }
        Returns: Json
      }
      create_admin_link: {
        Args: { duration_minutes: number }
        Returns: Json
      }
      create_admin_link_secure: {
        Args: { duration_minutes: number }
        Returns: Json
      }
      create_order_verification_code: {
        Args: {
          p_browser_info?: Json
          p_customer_info: Json
          p_discount_info?: Json
          p_ip_address?: unknown
          p_items: Json
          p_shipping_info?: Json
          p_total_amount: number
          p_user_agent?: string
          p_user_id: string
        }
        Returns: Json
      }
      debug_column_references: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_problematic_ref: boolean
          source_name: string
          source_type: string
        }[]
      }
      delete_master_product_cascade: {
        Args: { p_master_product_id: string }
        Returns: Json
      }
      detect_friction_patterns: {
        Args: { p_page_url: string; p_session_id: string }
        Returns: Json
      }
      diagnose_product_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      earn_coins: {
        Args: {
          p_action: string
          p_amount?: number
          p_description?: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: Json
      }
      generate_admin_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_daily_code: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_order_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_redemption_code: {
        Args: { p_cost: number; p_product_id: string; p_user_id: string }
        Returns: Json
      }
      generate_unique_4digit_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_daily_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_abandonment_analysis_by_sector: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_active_subscription: {
        Args: { user_id: string }
        Returns: {
          discount_percentage: number
          end_date: string
          plan_name: string
          subscription_id: string
        }[]
      }
      get_behavioral_segmentation: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_churn_prediction: {
        Args: { p_risk_threshold?: number; p_user_id?: string }
        Returns: Json
      }
      get_conversion_routes_analysis: {
        Args: { p_end_date?: string; p_limit?: number; p_start_date?: string }
        Returns: Json
      }
      get_current_bonus_period_brasilia: {
        Args: Record<PropertyKey, never>
        Returns: {
          can_claim: boolean
          next_reset: string
          period_end: string
          period_start: string
        }[]
      }
      get_dashboard_analytics: {
        Args: { end_date: string; start_date: string }
        Returns: {
          avg_conversion_rate: number
          avg_order_value: number
          cart_abandonment_rate: number
          period_data: Json
          total_purchases: number
          total_revenue: number
          total_sessions: number
          whatsapp_clicks: number
        }[]
      }
      get_friction_points_analysis: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_heatmap_enterprise_data: {
        Args: {
          p_end_date?: string
          p_interaction_type?: string
          p_page_url: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_performance_correlation: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_predictive_conversion_score: {
        Args: { p_session_id: string }
        Returns: Json
      }
      get_product_intelligence: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_products_with_tags_corrected: {
        Args: {
          include_admin?: boolean
          limit_count?: number
          tag_filter?: string[]
        }
        Returns: {
          additional_images: string[]
          available_variants: Json
          badge_color: string
          badge_text: string
          badge_visible: boolean
          brand: string
          breadcrumb_config: Json
          category: string
          colors: string[]
          condition: string
          created_at: string
          delivery_config: Json
          digital_price: number
          discount_percentage: number
          discount_price: number
          display_config: Json
          free_shipping: boolean
          inherit_from_master: Json
          installment_options: number
          is_active: boolean
          is_featured: boolean
          is_master_product: boolean
          list_price: number
          manual_related_products: Json
          master_slug: string
          meta_description: string
          meta_title: string
          new_price: number
          parent_product_id: string
          pix_discount_percentage: number
          platform: string
          pro_discount_percent: number
          pro_price: number
          product_description: string
          product_descriptions: Json
          product_faqs: Json
          product_features: Json
          product_highlights: Json
          product_id: string
          product_image: string
          product_name: string
          product_price: number
          product_stock: number
          product_type: string
          product_videos: Json
          promotional_price: number
          rating_average: number
          rating_count: number
          reviews_config: Json
          shipping_weight: number
          sizes: string[]
          sku_code: string
          slug: string
          sort_order: number
          specifications: Json
          tag_id: string
          tag_name: string
          technical_specs: Json
          trust_indicators: Json
          updated_at: string
          uti_pro_custom_price: number
          uti_pro_enabled: boolean
          uti_pro_price: number
          uti_pro_type: string
          uti_pro_value: number
          variant_attributes: Json
        }[]
      }
      get_real_time_alerts: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_realtime_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_realtime_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_top_products_analytics: {
        Args: { end_date: string; limit_count?: number; start_date: string }
        Returns: {
          avg_conversion_rate: number
          product_id: string
          product_name: string
          total_add_to_cart: number
          total_purchases: number
          total_revenue: number
          total_views: number
          whatsapp_clicks: number
        }[]
      }
      get_user_complete_journey: {
        Args: { p_include_interactions?: boolean; p_session_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_total_savings: {
        Args: { p_user_id: string }
        Returns: {
          promotion_savings: number
          total_purchases: number
          total_savings: number
          uti_pro_savings: number
        }[]
      }
      has_active_subscription: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_code_valid: {
        Args: { p_code: string }
        Returns: boolean
      }
      is_email_confirmed: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_flagged: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_details?: Json
          p_ip_address?: unknown
          p_resource_id?: string
          p_resource_type?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; user_id?: string }
        Returns: undefined
      }
      monitor_query_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_duration_ms: number
          query_type: string
          table_name: string
          total_calls: number
        }[]
      }
      process_analytics_batch: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_daily_login: {
        Args: { p_user_id: string }
        Returns: Json
      }
      process_daily_login_brasilia: {
        Args: { p_user_id: string }
        Returns: Json
      }
      process_daily_login_test: {
        Args: { p_user_id: string }
        Returns: Json
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      redeem_code_admin: {
        Args: { p_admin_id: string; p_code: string }
        Returns: Json
      }
      redeem_coin_product: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: Json
      }
      redeem_pro_code: {
        Args: { p_code_id: string; p_end_date: string; p_user_id: string }
        Returns: Json
      }
      refresh_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      remover_meses_assinatura: {
        Args: { meses: number; user_id: string }
        Returns: boolean
      }
      test_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          can_read_profiles: boolean
          current_user_id: string
          is_admin_result: boolean
          user_exists: boolean
          user_role: string
        }[]
      }
      update_user_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      validate_admin_token: {
        Args: { p_ip?: string; p_token: string }
        Returns: Json
      }
      validate_product_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          integrity_issues: string[]
          invalid_tag_references: number
          orphaned_product_tags: number
          products_with_tags: number
          products_without_tags: number
          total_products: number
        }[]
      }
      verify_order_code: {
        Args: { p_code: string }
        Returns: Json
      }
      verify_redemption_code: {
        Args: { p_code: string }
        Returns: Json
      }
    }
    Enums: {
      section_item_type: "product" | "tag"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      section_item_type: ["product", "tag"],
    },
  },
} as const
