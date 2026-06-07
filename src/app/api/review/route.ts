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

  // 先取得現有資料，判斷要更新哪個欄位
  const { data: existing, error: fetchError } = await db
    .from('reflections')
    .select('teacher_id, teacher2_id')
    .eq('id', reflectionId)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: '找不到心得' }, { status: 404 })
  }

  let updatePayload: Record<string, unknown>

  if (!existing.teacher_id) {
    // 第一位老師批改
    updatePayload = {
      status: 'reviewed',
      teacher_id: teacherId,
      teacher_name: TEACHERS[teacherId].name,
      teacher_comment: comment.trim(),
      reviewed_at: new Date().toISOString(),
    }
  } else if (existing.teacher_id === teacherId) {
    // 同一位老師更新自己的評語
    updatePayload = {
      teacher_comment: comment.trim(),
      reviewed_at: new Date().toISOString(),
    }
  } else if (!existing.teacher2_id) {
    // 第二位老師批改
    updatePayload = {
      teacher2_id: teacherId,
      teacher2_name: TEACHERS[teacherId].name,
      teacher2_comment: comment.trim(),
      reviewed2_at: new Date().toISOString(),
    }
  } else if (existing.teacher2_id === teacherId) {
    // 第二位老師更新自己的評語
    updatePayload = {
      teacher2_comment: comment.trim(),
      reviewed2_at: new Date().toISOString(),
    }
  } else {
    return NextResponse.json({ error: '兩位老師都已批改' }, { status: 400 })
  }

  const { data, error } = await db
    .from('reflections')
    .update(updatePayload)
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
