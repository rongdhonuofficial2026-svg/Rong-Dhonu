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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      artwork_images: {
        Row: {
          artwork_id: string | null
          created_at: string | null
          id: string
          order_index: number | null
          type: string
          url_high: string | null
          url_medium: string | null
          url_thumbnail: string | null
          url_zoom: string | null
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          type: string
          url_high?: string | null
          url_medium?: string | null
          url_thumbnail?: string | null
          url_zoom?: string | null
        }
        Update: {
          artwork_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          type?: string
          url_high?: string | null
          url_medium?: string | null
          url_thumbnail?: string | null
          url_zoom?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artwork_images_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          artist_id: string | null
          availability:
            | Database["public"]["Enums"]["availability_status"]
            | string
            | null
          category: string | null
          created_at: string | null
          creation_date: string | null
          description_bn: string | null
          description_en: string | null
          dimensions: string | null
          display_location: string | null
          exhibition_id: string | null
          framed: boolean | null
          fts: unknown
          gdrive_backup_id: string | null
          id: string
          insurance_value: number | null
          main_image_url: string | null
          materials_bn: string | null
          materials_en: string | null
          medium_bn: string | null
          medium_en: string | null
          notes: string | null
          orientation: string | null
          price: number | null
          status: Database["public"]["Enums"]["artwork_status"] | null
          theme: string | null
          title_bn: string | null
          title_en: string
          updated_at: string | null
          weight: string | null
          year: number | null
        }
        Insert: {
          artist_id?: string | null
          availability?:
            | Database["public"]["Enums"]["availability_status"]
            | string
            | null
          category?: string | null
          created_at?: string | null
          creation_date?: string | null
          description_bn?: string | null
          description_en?: string | null
          dimensions?: string | null
          display_location?: string | null
          exhibition_id?: string | null
          framed?: boolean | null
          fts?: unknown
          gdrive_backup_id?: string | null
          id?: string
          insurance_value?: number | null
          main_image_url?: string | null
          materials_bn?: string | null
          materials_en?: string | null
          medium_bn?: string | null
          medium_en?: string | null
          notes?: string | null
          orientation?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["artwork_status"] | null
          theme?: string | null
          title_bn?: string | null
          title_en: string
          updated_at?: string | null
          weight?: string | null
          year?: number | null
        }
        Update: {
          artist_id?: string | null
          availability?:
            | Database["public"]["Enums"]["availability_status"]
            | string
            | null
          category?: string | null
          created_at?: string | null
          creation_date?: string | null
          description_bn?: string | null
          description_en?: string | null
          dimensions?: string | null
          display_location?: string | null
          exhibition_id?: string | null
          framed?: boolean | null
          fts?: unknown
          gdrive_backup_id?: string | null
          id?: string
          insurance_value?: number | null
          main_image_url?: string | null
          materials_bn?: string | null
          materials_en?: string | null
          medium_bn?: string | null
          medium_en?: string | null
          notes?: string | null
          orientation?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["artwork_status"] | null
          theme?: string | null
          title_bn?: string | null
          title_en?: string
          updated_at?: string | null
          weight?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artworks_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "exhibitions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogs: {
        Row: {
          change_notes: string | null
          cover_image_url: string | null
          created_at: string | null
          description_bn: string | null
          description_en: string | null
          exhibition_id: string | null
          id: string
          language: string
          last_download_at: string | null
          pdf_url: string
          status: string
          title_bn: string | null
          title_en: string
          total_downloads: number | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: string
          year: number
        }
        Insert: {
          change_notes?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          exhibition_id?: string | null
          id?: string
          language?: string
          last_download_at?: string | null
          pdf_url: string
          status?: string
          title_bn?: string | null
          title_en: string
          total_downloads?: number | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string
          year: number
        }
        Update: {
          change_notes?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          exhibition_id?: string | null
          id?: string
          language?: string
          last_download_at?: string | null
          pdf_url?: string
          status?: string
          title_bn?: string | null
          title_en?: string
          total_downloads?: number | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalogs_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "exhibitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content: {
        Row: {
          content_bn: Json
          content_en: Json
          created_at: string | null
          id: string
          page: string
          section: string
          updated_at: string | null
        }
        Insert: {
          content_bn: Json
          content_en: Json
          created_at?: string | null
          id?: string
          page: string
          section: string
          updated_at?: string | null
        }
        Update: {
          content_bn?: Json
          content_en?: Json
          created_at?: string | null
          id?: string
          page?: string
          section?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      committee_members: {
        Row: {
          created_at: string | null
          exhibition_id: string | null
          id: string
          profile_id: string | null
          role_bn: string
          role_en: string
          year: number
        }
        Insert: {
          created_at?: string | null
          exhibition_id?: string | null
          id?: string
          profile_id?: string | null
          role_bn: string
          role_en: string
          year: number
        }
        Update: {
          created_at?: string | null
          exhibition_id?: string | null
          id?: string
          profile_id?: string | null
          role_bn?: string
          role_en?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "exhibitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          date_time: string
          description_bn: string | null
          description_en: string | null
          exhibition_id: string | null
          id: string
          speaker_bn: string | null
          speaker_en: string | null
          title_bn: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_time: string
          description_bn?: string | null
          description_en?: string | null
          exhibition_id?: string | null
          id?: string
          speaker_bn?: string | null
          speaker_en?: string | null
          title_bn: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_time?: string
          description_bn?: string | null
          description_en?: string | null
          exhibition_id?: string | null
          id?: string
          speaker_bn?: string | null
          speaker_en?: string | null
          title_bn?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "exhibitions"
            referencedColumns: ["id"]
          },
        ]
      }
      exhibition_participants: {
        Row: {
          artist_id: string | null
          created_at: string | null
          exhibition_id: string | null
          id: string
          status: Database["public"]["Enums"]["participant_status"] | null
          updated_at: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          exhibition_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["participant_status"] | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          exhibition_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["participant_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exhibition_participants_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exhibition_participants_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "exhibitions"
            referencedColumns: ["id"]
          },
        ]
      }
      exhibitions: {
        Row: {
          created_at: string | null
          description_bn: string | null
          description_en: string | null
          exhibition_end: string | null
          exhibition_start: string | null
          hero_image_url: string | null
          id: string
          registration_start: string | null
          status: Database["public"]["Enums"]["exhibition_status"] | null
          submission_end: string | null
          theme_bn: string
          theme_en: string
          updated_at: string | null
          venue_bn: string | null
          venue_en: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          exhibition_end?: string | null
          exhibition_start?: string | null
          hero_image_url?: string | null
          id?: string
          registration_start?: string | null
          status?: Database["public"]["Enums"]["exhibition_status"] | null
          submission_end?: string | null
          theme_bn: string
          theme_en: string
          updated_at?: string | null
          venue_bn?: string | null
          venue_en?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          exhibition_end?: string | null
          exhibition_start?: string | null
          hero_image_url?: string | null
          id?: string
          registration_start?: string | null
          status?: Database["public"]["Enums"]["exhibition_status"] | null
          submission_end?: string | null
          theme_bn?: string
          theme_en?: string
          updated_at?: string | null
          venue_bn?: string | null
          venue_en?: string | null
          year?: number
        }
        Relationships: []
      }
      gallery_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name_bn: string
          name_en: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name_bn: string
          name_en: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_collections: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description_bn: string | null
          description_en: string | null
          id: string
          is_featured: boolean | null
          name_bn: string
          name_en: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          id?: string
          is_featured?: boolean | null
          name_bn: string
          name_en: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          id?: string
          is_featured?: boolean | null
          name_bn?: string
          name_en?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_media: {
        Row: {
          alt_text: string | null
          caption_bn: string | null
          caption_en: string | null
          category: string
          collection_id: string | null
          created_at: string | null
          description_bn: string | null
          description_en: string | null
          deleted_at: string | null
          duration: number | null
          exhibition_id: string | null
          height: number | null
          id: string
          is_featured: boolean | null
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type: string | null
          original_file_name: string | null
          photographer: string | null
          size_bytes: number | null
          sort_order: number | null
          status: string | null
          tags: Json | null
          thumbnail_url: string | null
          title_bn: string | null
          title_en: string | null
          updated_at: string | null
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption_bn?: string | null
          caption_en?: string | null
          category: string
          collection_id?: string | null
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          deleted_at?: string | null
          duration?: number | null
          exhibition_id?: string | null
          height?: number | null
          id?: string
          is_featured?: boolean | null
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          original_file_name?: string | null
          photographer?: string | null
          size_bytes?: number | null
          sort_order?: number | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption_bn?: string | null
          caption_en?: string | null
          category?: string
          collection_id?: string | null
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          deleted_at?: string | null
          duration?: number | null
          exhibition_id?: string | null
          height?: number | null
          id?: string
          is_featured?: boolean | null
          media_type?: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          original_file_name?: string | null
          photographer?: string | null
          size_bytes?: number | null
          sort_order?: number | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_media_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "gallery_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_media_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "exhibitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      global_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message_bn: string
          message_en: string
          read_status: boolean | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_bn: string
          message_en: string
          read_status?: boolean | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_bn?: string
          message_en?: string
          read_status?: boolean | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          awards: Json | null
          bio_bn: string | null
          bio_en: string | null
          created_at: string | null
          email: string
          full_name_bn: string | null
          full_name_en: string | null
          id: string
          instagram_url: string | null
          notify_artwork_updates: boolean | null
          notify_deadline_reminders: boolean | null
          notify_email: boolean | null
          notify_exhibition_announcements: boolean | null
          notify_in_app: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          slug: string | null
          social_links: Json | null
          statistics: Json | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          awards?: Json | null
          bio_bn?: string | null
          bio_en?: string | null
          created_at?: string | null
          email: string
          full_name_bn?: string | null
          full_name_en?: string | null
          id: string
          instagram_url?: string | null
          notify_artwork_updates?: boolean | null
          notify_deadline_reminders?: boolean | null
          notify_email?: boolean | null
          notify_exhibition_announcements?: boolean | null
          notify_in_app?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          slug?: string | null
          social_links?: Json | null
          statistics?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          awards?: Json | null
          bio_bn?: string | null
          bio_en?: string | null
          created_at?: string | null
          email?: string
          full_name_bn?: string | null
          full_name_en?: string | null
          id?: string
          instagram_url?: string | null
          notify_artwork_updates?: boolean | null
          notify_deadline_reminders?: boolean | null
          notify_email?: boolean | null
          notify_exhibition_announcements?: boolean | null
          notify_in_app?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          slug?: string | null
          social_links?: Json | null
          statistics?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_catalog_downloads: {
        Args: { catalog_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_committee: { Args: never; Returns: boolean }
    }
    Enums: {
      artwork_status: "pending" | "approved" | "rejected" | "changes_requested"
      availability_status: "available" | "sold" | "not_for_sale"
      exhibition_status:
        | "draft"
        | "upcoming"
        | "ongoing"
        | "registration_open"
        | "submission_open"
        | "submission_closed"
        | "reviewing"
        | "published"
        | "archived"
      media_type: "image" | "video"
      notification_type:
        | "registration_approved"
        | "submission_received"
        | "submission_approved"
        | "submission_rejected"
        | "deadline_reminder"
        | "catalog_published"
        | "new_exhibition"
        | "changes_requested"
      participant_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "member" | "owner"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      artwork_status: ["pending", "approved", "rejected", "changes_requested"],
      availability_status: ["available", "sold", "not_for_sale"],
      exhibition_status: [
        "draft",
        "registration_open",
        "submission_open",
        "submission_closed",
        "reviewing",
        "published",
        "archived",
      ],
      media_type: ["image", "video"],
      notification_type: [
        "registration_approved",
        "submission_received",
        "submission_approved",
        "submission_rejected",
        "deadline_reminder",
        "catalog_published",
        "new_exhibition",
        "changes_requested",
      ],
      participant_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "member", "owner"],
    },
  },
} as const
