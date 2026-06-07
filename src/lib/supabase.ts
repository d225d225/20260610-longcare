import { createClient } from '@supabase/supabase-js'

export type Reflection = {
  id: string
  class: string
  seat_number: string
  name: string
  email: string
  content: string
  status: 'pending' | 'reviewed' | 'hidden'
  teacher_id: 'lulu' | 'yichi' | null
  teacher_name: string | null
  teacher_comment: string | null
  reviewed_at: string | null
  teacher2_id: 'lulu' | 'yichi' | null
  teacher2_name: string | null
  teacher2_comment: string | null
  reviewed2_at: string | null
  created_at: string
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon)

export function serviceSupabase() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
