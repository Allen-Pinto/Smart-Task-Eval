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
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          credits: number
          is_premium: boolean
          razorpay_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          is_premium?: boolean
          razorpay_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          is_premium?: boolean
          razorpay_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          code_text: string | null
          file_url: string | null
          language: string
          status: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          code_text?: string | null
          file_url?: string | null
          language?: string
          status?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          code_text?: string | null
          file_url?: string | null
          language?: string
          status?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          task_id: string
          score: number | null
          strengths: Json
          improvements: Json
          summary: string | null
          full_report: string | null
          is_unlocked: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          score?: number | null
          strengths?: Json
          improvements?: Json
          summary?: string | null
          full_report?: string | null
          is_unlocked?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          score?: number | null
          strengths?: Json
          improvements?: Json
          summary?: string | null
          full_report?: string | null
          is_unlocked?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          amount: number
          currency: string
          status: string
          plan_type: string
          notes: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount: number
          currency?: string
          status?: string
          plan_type?: string
          notes?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount?: number
          currency?: string
          status?: string
          plan_type?: string
          notes?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}