import { NextRequest, NextResponse } from 'next/server'
import { verifyTeacher, TEACHERS } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { id, password } = await req.json()
  const teacherId = verifyTeacher(id, password)

  if (!teacherId) {
    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 })
  }

  const token = Buffer.from(`${id}:${password}`).toString('base64')
  return NextResponse.json({ token, teacher: TEACHERS[teacherId], id: teacherId })
}
