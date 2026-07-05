export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      global_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      cms_content: {
        Row: {
          id: string
          page: string
          section: string
          content_en: Json
          content_bn: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page: string
          section: string
          content_en: Json
          content_bn: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page?: string
          section?: string
          content_en?: Json
          content_bn?: Json
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'member' | 'committee'
          slug: string | null
          full_name_en: string | null
          full_name_bn: string | null
          bio_en: string | null
          bio_bn: string | null
          avatar_url: string | null
          social_links: Json | null
          awards: Json | null
          statistics: Json | null
          phone: string | null
          email: string
          notify_email: boolean | null
          notify_in_app: boolean | null
          notify_exhibition_announcements: boolean | null
          notify_deadline_reminders: boolean | null
          notify_artwork_updates: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'member' | 'committee'
          slug?: string | null
          full_name_en?: string | null
          full_name_bn?: string | null
          bio_en?: string | null
          bio_bn?: string | null
          avatar_url?: string | null
          social_links?: Json | null
          awards?: Json | null
          statistics?: Json | null
          phone?: string | null
          email: string
          notify_email?: boolean
          notify_in_app?: boolean
          notify_exhibition_announcements?: boolean
          notify_deadline_reminders?: boolean
          notify_artwork_updates?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'member' | 'committee'
          slug?: string | null
          full_name_en?: string | null
          full_name_bn?: string | null
          bio_en?: string | null
          bio_bn?: string | null
          avatar_url?: string | null
          social_links?: Json | null
          awards?: Json | null
          statistics?: Json | null
          phone?: string | null
          email?: string
          notify_email?: boolean
          notify_in_app?: boolean
          notify_exhibition_announcements?: boolean
          notify_deadline_reminders?: boolean
          notify_artwork_updates?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      exhibitions: {
        Row: {
          id: string
          year: number
          theme_en: string
          theme_bn: string
          description_en: string | null
          description_bn: string | null
          status: 'draft' | 'registration_open' | 'submission_open' | 'submission_closed' | 'reviewing' | 'published' | 'archived'
          registration_start: string | null
          submission_end: string | null
          exhibition_start: string | null
          exhibition_end: string | null
          venue_en: string | null
          venue_bn: string | null
          hero_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: number
          theme_en: string
          theme_bn: string
          description_en?: string | null
          description_bn?: string | null
          status?: 'draft' | 'registration_open' | 'submission_open' | 'submission_closed' | 'reviewing' | 'published' | 'archived'
          registration_start?: string | null
          submission_end?: string | null
          exhibition_start?: string | null
          exhibition_end?: string | null
          venue_en?: string | null
          venue_bn?: string | null
          hero_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: number
          theme_en?: string
          theme_bn?: string
          description_en?: string | null
          description_bn?: string | null
          status?: 'draft' | 'registration_open' | 'submission_open' | 'submission_closed' | 'reviewing' | 'published' | 'archived'
          registration_start?: string | null
          submission_end?: string | null
          exhibition_start?: string | null
          exhibition_end?: string | null
          venue_en?: string | null
          venue_bn?: string | null
          hero_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      committee_members: {
        Row: {
          id: string
          exhibition_id: string
          profile_id: string
          role_en: string
          role_bn: string
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          profile_id: string
          role_en: string
          role_bn: string
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          profile_id?: string
          role_en?: string
          role_bn?: string
          year?: number
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          exhibition_id: string
          date_time: string
          title_en: string
          title_bn: string
          description_en: string | null
          description_bn: string | null
          speaker_en: string | null
          speaker_bn: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          date_time: string
          title_en: string
          title_bn: string
          description_en?: string | null
          description_bn?: string | null
          speaker_en?: string | null
          speaker_bn?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          date_time?: string
          title_en?: string
          title_bn?: string
          description_en?: string | null
          description_bn?: string | null
          speaker_en?: string | null
          speaker_bn?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exhibition_participants: {
        Row: {
          id: string
          exhibition_id: string
          artist_id: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          artist_id: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          artist_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          exhibition_id: string
          artist_id: string
          title_en: string
          title_bn: string
          description_en: string | null
          description_bn: string | null
          medium_en: string
          medium_bn: string
          materials_en: string
          materials_bn: string
          dimensions: string
          weight: string | null
          creation_date: string | null
          category: string | null
          theme: string | null
          orientation: string | null
          framed: boolean | null
          price: number | null
          insurance_value: number | null
          availability: 'available' | 'sold' | 'not_for_sale' | null
          display_location: string | null
          notes: string | null
          status: 'pending' | 'approved' | 'rejected' | null
          gdrive_backup_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          artist_id: string
          title_en: string
          title_bn: string
          description_en?: string | null
          description_bn?: string | null
          medium_en: string
          medium_bn: string
          materials_en: string
          materials_bn: string
          dimensions: string
          weight?: string | null
          creation_date?: string | null
          category?: string | null
          theme?: string | null
          orientation?: string | null
          framed?: boolean | null
          price?: number | null
          insurance_value?: number | null
          availability?: 'available' | 'sold' | 'not_for_sale' | null
          display_location?: string | null
          notes?: string | null
          status?: 'pending' | 'approved' | 'rejected' | null
          gdrive_backup_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          artist_id?: string
          title_en?: string
          title_bn?: string
          description_en?: string | null
          description_bn?: string | null
          medium_en?: string
          medium_bn?: string
          materials_en?: string
          materials_bn?: string
          dimensions?: string
          weight?: string | null
          creation_date?: string | null
          category?: string | null
          theme?: string | null
          orientation?: string | null
          framed?: boolean | null
          price?: number | null
          insurance_value?: number | null
          availability?: 'available' | 'sold' | 'not_for_sale' | null
          display_location?: string | null
          notes?: string | null
          status?: 'pending' | 'approved' | 'rejected' | null
          gdrive_backup_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artwork_images: {
        Row: {
          id: string
          artwork_id: string
          type: string
          url_thumbnail: string | null
          url_medium: string | null
          url_high: string | null
          url_zoom: string | null
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          artwork_id: string
          type: string
          url_thumbnail?: string | null
          url_medium?: string | null
          url_high?: string | null
          url_zoom?: string | null
          order_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          artwork_id?: string
          type?: string
          url_thumbnail?: string | null
          url_medium?: string | null
          url_high?: string | null
          url_zoom?: string | null
          order_index?: number | null
          created_at?: string
        }
      }
      gallery_media: {
        Row: {
          id: string
          exhibition_id: string | null
          category: string
          media_type: 'image' | 'video'
          url: string
          caption_en: string | null
          caption_bn: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id?: string | null
          category: string
          media_type: 'image' | 'video'
          url: string
          caption_en?: string | null
          caption_bn?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string | null
          category?: string
          media_type?: 'image' | 'video'
          url?: string
          caption_en?: string | null
          caption_bn?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      catalogs: {
        Row: {
          id: string
          exhibition_id: string
          year: number
          cover_image_url: string | null
          title_en: string
          title_bn: string | null
          description_en: string | null
          description_bn: string | null
          pdf_url: string
          language: string
          version: string
          status: string
          change_notes: string | null
          uploaded_by: string | null
          uploaded_at: string | null
          total_downloads: number | null
          last_download_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          year: number
          cover_image_url?: string | null
          title_en: string
          title_bn?: string | null
          description_en?: string | null
          description_bn?: string | null
          pdf_url: string
          language?: string
          version?: string
          status?: string
          change_notes?: string | null
          uploaded_by?: string | null
          uploaded_at?: string | null
          total_downloads?: number | null
          last_download_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          year?: number
          cover_image_url?: string | null
          title_en?: string
          title_bn?: string | null
          description_en?: string | null
          description_bn?: string | null
          pdf_url?: string
          language?: string
          version?: string
          status?: string
          change_notes?: string | null
          uploaded_by?: string | null
          uploaded_at?: string | null
          total_downloads?: number | null
          last_download_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'registration_approved' | 'submission_received' | 'submission_approved' | 'submission_rejected' | 'deadline_reminder' | 'catalog_published' | 'new_exhibition'
          message_en: string
          message_bn: string
          read_status: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'registration_approved' | 'submission_received' | 'submission_approved' | 'submission_rejected' | 'deadline_reminder' | 'catalog_published' | 'new_exhibition'
          message_en: string
          message_bn: string
          read_status?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'registration_approved' | 'submission_received' | 'submission_approved' | 'submission_rejected' | 'deadline_reminder' | 'catalog_published' | 'new_exhibition'
          message_en?: string
          message_bn?: string
          read_status?: boolean | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string
          details?: Json | null
          created_at?: string
        }
      }
    }
  }
}
