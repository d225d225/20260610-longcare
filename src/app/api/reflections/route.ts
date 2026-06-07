import { NextRequest, NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/supabase'
import { verifyTeacher } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-teacher-token') ?? ''
  const [id, password] = Buffer.from(token, 'base64').toString().split(':')
  const teacherId = verifyTeacher(id, password)

  const db = serviceSupabase()

  if (teacherId) {
    const { data, error } = await db
      .from('reflections')
      .select('*')
      .neq('status', 'hidden')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // 公開只顯示已批閱，不含 email
  const { data, error } = await db
    .from('reflections')
    .select('id,class,seat_number,name,content,status,teacher_id,teacher_name,teacher_comment,reviewed_at,teacher2_id,teacher2_name,teacher2_comment,reviewed2_at,created_at')
    .eq('status', 'reviewed')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
