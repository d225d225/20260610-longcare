export type TeacherId = 'lulu' | 'yichi'

export const TEACHERS: Record<TeacherId, { name: string; email: string }> = {
  lulu: { name: '盧盧老師', email: 'd225@yphs.tw' },
  yichi: { name: '怡琪老師', email: 'yichi@yphs.tw' },
}

export function verifyTeacher(id: string, password: string): TeacherId | null {
  if (id === 'lulu' && password === process.env.TEACHER_LULU_PASSWORD) return 'lulu'
  if (id === 'yichi' && password === process.env.TEACHER_YICHI_PASSWORD) return 'yichi'
  return null
}
