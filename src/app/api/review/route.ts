import { NextRequest, NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/supabase'
import { verifyTeacher, TEACHERS } from '@/lib/auth'
import { sendReviewEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-teacher-token') ?? ''
  const [id, password] = Buffer.from(token, 'base64').toString().split(':')
  const teacherId = verifyTeacher(id, password)

  if (!teacherId) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { reflectionId, comment } = await req.json()
  if (!reflectionId || !comment?.trim()) {
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
  }

  const db = serviceSupabase()

  const { data, error } = await db
    .from('reflections')
    .update({
      status: 'reviewed',
      teacher_id: teacherId,
      teacher_name: TEACHERS[teacherId].name,
      teacher_comment: comment.trim(),
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reflectionId)
    .select()
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: '更新失敗' }, { status: 500 })
  }

  try {
    await sendReviewEmail(data)
  } catch (e) {
    console.error('Email 發送失敗:', e)
  }

  return NextResponse.json({ ok: true })
}
