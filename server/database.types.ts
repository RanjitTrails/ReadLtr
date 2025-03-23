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
      users: {
        Row: {
          id: number
          username: string
          password: string
          email: string
          name: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          username: string
          password: string
          email: string
          name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          username?: string
          password?: string
          email?: string
          name?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          id: number
          user_id: number
          title: string
          url: string
          content: string | null
          description: string | null
          author: string | null
          site_name: string | null
          site_icon: string | null
          saved_at: string | null
          read_at: string | null
          is_archived: boolean | null
          labels: string[] | null
          reading_progress: number | null
        }
        Insert: {
          id?: number
          user_id: number
          title: string
          url: string
          content?: string | null
          description?: string | null
          author?: string | null
          site_name?: string | null
          site_icon?: string | null
          saved_at?: string | null
          read_at?: string | null
          is_archived?: boolean | null
          labels?: string[] | null
          reading_progress?: number | null
        }
        Update: {
          id?: number
          user_id?: number
          title?: string
          url?: string
          content?: string | null
          description?: string | null
          author?: string | null
          site_name?: string | null
          site_icon?: string | null
          saved_at?: string | null
          read_at?: string | null
          is_archived?: boolean | null
          labels?: string[] | null
          reading_progress?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      labels: {
        Row: {
          id: number
          user_id: number
          name: string
          color: string | null
        }
        Insert: {
          id?: number
          user_id: number
          name: string
          color?: string | null
        }
        Update: {
          id?: number
          user_id?: number
          name?: string
          color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}