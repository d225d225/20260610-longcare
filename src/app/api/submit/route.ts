import { NextRequest, NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { class: cls, seat_number, name, email, content } = body

  if (!cls || !seat_number || !name || !email || !content) {
    return NextResponse.json({ error: '所有欄位皆為必填' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email 格式不正確' }, { status: 400 })
  }

  const db = serviceSupabase()
  const { error } = await db.from('reflections').insert({
    class: cls,
    seat_number,
    name,
    email,
    content,
    status: 'pending',
  })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: '儲存失敗，請稍後再試' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
