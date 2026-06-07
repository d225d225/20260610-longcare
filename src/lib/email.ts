import { Resend } from 'resend'
import type { Reflection } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'noreply@example.com'

const TEACHERS = {
  lulu: { name: '盧盧老師', email: 'd225@yphs.tw' },
  yichi: { name: '怡琪老師', email: 'yichi@yphs.tw' },
}

export async function sendReviewEmail(reflection: Reflection) {
  if (!reflection.teacher_id || !reflection.teacher_comment) return

  const teacher = TEACHERS[reflection.teacher_id]
  const otherTeacher = reflection.teacher_id === 'lulu' ? TEACHERS.yichi : TEACHERS.lulu
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const stampColor = '#c0392b'
  const stampHtml = `
    <div style="display:inline-block;border:4px solid ${stampColor};border-radius:50%;
                padding:12px 16px;color:${stampColor};font-weight:bold;font-size:15px;
                transform:rotate(-12deg);opacity:0.85;letter-spacing:1px;
                font-family:'Noto Serif TC',serif;text-align:center;line-height:1.4;">
      ✦<br>${teacher.name}<br>已批閱<br>✦
    </div>`

  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="UTF-8"><title>心得批閱通知</title></head>
<body style="font-family:'Noto Sans TC',Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px;background:#fffaf7;">
  <h2 style="color:#7f3b3b;border-bottom:2px solid #e8c4c4;padding-bottom:8px;">
    📋 青銀共融活動心得 — 老師批閱通知
  </h2>

  <p style="color:#333;">親愛的 <strong>${reflection.name}</strong> 同學你好，</p>
  <p style="color:#333;">
    你在「115年度青銀共融一日照服小幫手體驗活動」的服務心得已由 <strong>${teacher.name}</strong> 完成批閱，
    請查閱以下內容：
  </p>

  <div style="background:#fff8f8;border-left:4px solid #e8c4c4;padding:16px;margin:16px 0;border-radius:4px;">
    <h3 style="margin:0 0 8px;color:#7f3b3b;">你的心得</h3>
    <p style="white-space:pre-wrap;color:#333;margin:0;">${escHtml(reflection.content)}</p>
  </div>

  <div style="background:#fff8f8;border-left:4px solid #c0392b;padding:16px;margin:16px 0;border-radius:4px;">
    <h3 style="margin:0 0 8px;color:#c0392b;">老師回饋</h3>
    <p style="white-space:pre-wrap;color:#c0392b;font-weight:500;margin:0;">${escHtml(reflection.teacher_comment!)}</p>
  </div>

  <div style="text-align:right;margin:24px 0;">
    ${stampHtml}
  </div>

  <hr style="border:none;border-top:1px solid #e8c4c4;margin:24px 0;">
  <p style="color:#888;font-size:13px;">
    完整心得展示牆：<a href="${appUrl}/showroom" style="color:#c0392b;">${appUrl}/showroom</a>
  </p>
</body>
</html>`

  await resend.emails.send({
    from: FROM,
    to: reflection.email,
    bcc: [teacher.email, otherTeacher.email],
    subject: `【心得批閱】${reflection.name} 同學的服務心得已由 ${teacher.name} 批閱`,
    html,
  })
}

function escHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
