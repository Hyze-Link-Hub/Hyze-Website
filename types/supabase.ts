export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProfileTheme = {
  background_type: "color" | "media" | "image" | "video" | "live_sync"
  background_value: string
  font: string
  live_sync_enabled: boolean
  live_sync_priority: "spotify" | "discord"
}

export type BadgeTriggerType = "manual" | "views" | "discord"

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      awarded_badges: {
        Row: {
          badge_id: string
          id: string
          is_equipped: boolean
          is_new: boolean
          is_pinned: boolean
          order_index: number
          profile_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          is_equipped?: boolean
          is_new?: boolean
          is_pinned?: boolean
          order_index?: number
          profile_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          is_equipped?: boolean
          is_new?: boolean
          is_pinned?: boolean
          order_index?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "awarded_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awarded_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          color: string
          description: string | null
          discord_role_id: string | null
          icon_svg: string
          id: string
          is_secret: boolean
          name: string
          threshold: number | null
          trigger_type: BadgeTriggerType
        }
        Insert: {
          category?: string
          color?: string
          description?: string | null
          discord_role_id?: string | null
          icon_svg: string
          id?: string
          is_secret?: boolean
          name: string
          threshold?: number | null
          trigger_type?: BadgeTriggerType
        }
        Update: {
          category?: string
          color?: string
          description?: string | null
          discord_role_id?: string | null
          icon_svg?: string
          id?: string
          is_secret?: boolean
          name?: string
          threshold?: number | null
          trigger_type?: BadgeTriggerType
        }
        Relationships: []
      }
      channels: {
        Row: {
          followers_text: string | null
          handle: string
          id: string
          platform: string
          profile_id: string
          url: string
        }
        Insert: {
          followers_text?: string | null
          handle: string
          id?: string
          platform: string
          profile_id: string
          url: string
        }
        Update: {
          followers_text?: string | null
          handle?: string
          id?: string
          platform?: string
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          message: string
          profile_id: string
          sender_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          message: string
          profile_id: string
          sender_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          message?: string
          profile_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook_signatures: {
        Row: {
          author_avatar: string | null
          author_id: string
          author_username: string
          created_at: string
          id: string
          is_pinned: boolean
          message: string
          profile_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_id: string
          author_username: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          message: string
          profile_id: string
        }
        Update: {
          author_avatar?: string | null
          author_id?: string
          author_username?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          message?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_signatures_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          referrer: string
          visitor_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          referrer?: string
          visitor_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          referrer?: string
          visitor_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          clicks: number
          id: string
          is_social: boolean
          order_index: number
          profile_id: string
          sort_order: number
          subtitle: string | null
          title: string
          url: string
        }
        Insert: {
          clicks?: number
          id?: string
          is_social?: boolean
          order_index?: number
          profile_id: string
          sort_order?: number
          subtitle?: string | null
          title: string
          url: string
        }
        Update: {
          clicks?: number
          id?: string
          is_social?: boolean
          order_index?: number
          profile_id?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          discord_id: string | null
          discord_role_ids: string[]
          display_name: string | null
          id: string
          is_premium: boolean
          lastfm_username: string | null
          live_status: Json | null
          show_badges: boolean
          show_discord_status: boolean
          show_lastfm: boolean
          theme: ProfileTheme
          username: string
          views: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          discord_id?: string | null
          discord_role_ids?: string[]
          display_name?: string | null
          id: string
          is_premium?: boolean
          lastfm_username?: string | null
          live_status?: Json | null
          show_badges?: boolean
          show_discord_status?: boolean
          show_lastfm?: boolean
          theme?: ProfileTheme
          username: string
          views?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          discord_id?: string | null
          discord_role_ids?: string[]
          display_name?: string | null
          id?: string
          is_premium?: boolean
          lastfm_username?: string | null
          live_status?: Json | null
          show_badges?: boolean
          show_discord_status?: boolean
          show_lastfm?: boolean
          theme?: ProfileTheme
          username?: string
          views?: number
        }
        Relationships: []
      }
      videos: {
        Row: {
          duration: string | null
          id: string
          profile_id: string
          thumbnail_url: string | null
          title: string
          url: string
          views_text: string | null
        }
        Insert: {
          duration?: string | null
          id?: string
          profile_id: string
          thumbnail_url?: string | null
          title: string
          url: string
          views_text?: string | null
        }
        Update: {
          duration?: string | null
          id?: string
          profile_id?: string
          thumbnail_url?: string | null
          title?: string
          url?: string
          views_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_link_clicks: { Args: { p_id: string }; Returns: undefined }
      increment_view_count: { Args: { p_id: string }; Returns: undefined }
      increment_views: { Args: { p_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
