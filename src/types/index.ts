export interface Task {
  id: string
  user_id: string
  title: string
  description: string
  code_text: string
  file_url: string | null
  language: string
  status: 'pending' | 'processing' | 'evaluated' | 'locked' | 'error'
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  task_id: string
  score: number | null
  strengths: string[]
  improvements: string[]
  summary: string | null
  full_report: string | null
  is_unlocked: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  credits: number
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  task_id: string
  amount: number
  currency: string
  status: 'created' | 'attempted' | 'paid' | 'failed' | 'canceled'
  razorpay_order_id: string
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  created_at: string
  updated_at: string
}