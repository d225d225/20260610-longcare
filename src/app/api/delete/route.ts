import { NextRequest, NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/supabase'
import { verifyTeacher } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-teacher-token') ?? ''
  const [id, password] = Buffer.from(token, 'base64').toString().split(':')
  const teacherId = verifyTeacher(id, password)

  if (!teacherId) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { reflectionId } = await req.json()
  if (!reflectionId) {
    return NextResponse.json({ error: '缺少 reflectionId' }, { status: 400 })
  }

  const db = serviceSupabase()
  const { error } = await db
    .from('reflections')
    .update({ status: 'hidden' })
    .eq('id', reflectionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
