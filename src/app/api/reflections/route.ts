import { NextRequest, NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/supabase'
import { verifyTeacher } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-teacher-token') ?? ''
  const [id, password] = Buffer.from(token, 'base64').toString().split(':')
  const teacherId = verifyTeacher(id, password)

  const db = serviceSupabase()

  if (teacherId) {
    // Teacher sees all non-hidden
    const { data, error } = await db
      .from('reflections')
      .select('*')
      .neq('status', 'hidden')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Public sees only reviewed
  const { data, error } = await db
    .from('reflections')
    .select('id,class,seat_number,name,content,teacher_name,teacher_id,teacher_comment,reviewed_at,created_at')
    .eq('status', 'reviewed')
    .order('reviewed_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
