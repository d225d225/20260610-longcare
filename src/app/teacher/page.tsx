'use client'
import { useEffect, useState } from 'react'
import Stamp from '@/components/Stamp'
import type { Reflection } from '@/lib/supabase'

type Session = { token: string; id: 'lulu' | 'yichi'; name: string; email: string }

function loadSession(): Session | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('teacher_token')
  const id = localStorage.getItem('teacher_id')
  const name = localStorage.getItem('teacher_name')
  const email = localStorage.getItem('teacher_email')
  if (token && id && name && email) return { token, id: id as 'lulu' | 'yichi', name, email }
  return null
}

function saveSession(s: Session) {
  localStorage.setItem('teacher_token', s.token)
  localStorage.setItem('teacher_id', s.id)
  localStorage.setItem('teacher_name', s.name)
  localStorage.setItem('teacher_email', s.email)
}

function clearSession() {
  ['teacher_token', 'teacher_id', 'teacher_name', 'teacher_email'].forEach(k => localStorage.removeItem(k))
}

/* ── Login Panel ── */
function LoginPanel({ onLogin }: { onLogin: (s: Session) => void }) {
  const [id, setId] = useState<'lulu' | 'yichi'>('lulu')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? '登入失敗'); return }
    const session: Session = { token: data.token, id: data.id, name: data.teacher.name, email: data.teacher.email }
    saveSession(session)
    onLogin(session)
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔐</div>
        <h1 className="text-2xl font-bold text-red-800">教師後台登入</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-red-100 p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">選擇身分</label>
          <div className="grid grid-cols-2 gap-3">
            {(['lulu', 'yichi'] as const).map(tid => (
              <button
                key={tid}
                type="button"
                onClick={() => setId(tid)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  id === tid
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-red-300'
                }`}
              >
                {tid === 'lulu' ? '盧盧老師' : '怡琪老師'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
            placeholder="請輸入密碼"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 disabled:opacity-50 transition-colors"
        >
          {loading ? '登入中…' : '登入'}
        </button>
      </form>
    </div>
  )
}

/* ── Review Modal ── */
function ReviewModal({
  reflection, session, onClose, onSave,
}: {
  reflection: Reflection
  session: Session
  onClose: () => void
  onSave: (comment: string) => Promise<void>
}) {
  // 判斷目前老師要填哪個欄位
  const isTeacher1 = reflection.teacher_id === session.id
  const isTeacher2 = reflection.teacher2_id === session.id
  const myExistingComment = isTeacher1
    ? (reflection.teacher_comment ?? '')
    : isTeacher2
    ? (reflection.teacher2_comment ?? '')
    : ''

  const [comment, setComment] = useState(myExistingComment)
  const [saving, setSaving] = useState(false)

  // 另一位老師的評語（唯讀顯示）
  const otherComment = isTeacher1
    ? reflection.teacher2_comment
    : reflection.teacher_comment
  const otherName = isTeacher1
    ? reflection.teacher2_name
    : reflection.teacher_name

  async function handleSave() {
    if (!comment.trim()) return
    setSaving(true)
    await onSave(comment.trim())
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{reflection.name} 的心得</h2>
            <p className="text-sm text-gray-500">{reflection.class} · {reflection.seat_number}號</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* 學生心得 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">學生心得</p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">
              {reflection.content}
            </p>
          </div>

          {/* 另一位老師已有的評語（唯讀） */}
          {otherComment && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-500 mb-1">{otherName} 已批改</p>
              <p className="text-orange-700 text-sm whitespace-pre-wrap">{otherComment}</p>
            </div>
          )}

          {/* 我的評語 */}
          <div>
            <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wider">
              {session.name} 的回饋
            </p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={5}
              placeholder="請輸入對學生心得的評語與回饋…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 resize-none"
            />
          </div>

          {/* 印章預覽 */}
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-400">儲存後將顯示印章：</p>
            <Stamp teacherId={session.id} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !comment.trim()}
              className="flex-1 py-2.5 bg-red-700 text-white rounded-xl font-semibold hover:bg-red-800 disabled:opacity-50 transition-colors text-sm"
            >
              {saving ? '儲存中…' : '儲存並發送通知'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Dashboard ── */
export default function TeacherDashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Reflection | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const s = loadSession()
    if (s) { setSession(s); fetchReflections(s.token) }
  }, [])

  async function fetchReflections(token: string) {
    setLoading(true)
    const res = await fetch('/api/reflections', { headers: { 'x-teacher-token': token } })
    const data = await res.json()
    setReflections(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleSave(comment: string) {
    if (!selected || !session) return
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-teacher-token': session.token },
      body: JSON.stringify({ reflectionId: selected.id, comment }),
    })
    if (res.ok) {
      setSelected(null)
      fetchReflections(session.token)
    }
  }

  async function handleDelete(id: string) {
    if (!session || !confirm('確定要隱藏此心得？')) return
    await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-teacher-token': session.token },
      body: JSON.stringify({ reflectionId: id }),
    })
    setReflections(prev => prev.filter(r => r.id !== id))
  }

  function handleLogin(s: Session) { setSession(s); fetchReflections(s.token) }
  function handleLogout() { clearSession(); setSession(null); setReflections([]) }

  if (!session) return <LoginPanel onLogin={handleLogin} />

  const filtered = reflections
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r =>
      !search ||
      r.name.includes(search) ||
      r.class.includes(search) ||
      r.content.includes(search)
    )

  const pending = reflections.filter(r => r.status === 'pending').length
  const reviewed = reflections.filter(r => r.status === 'reviewed').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-red-800">教師批改後台</h1>
          <p className="text-sm text-gray-500 mt-0.5">目前身分：{session.name} ({session.email})</p>
        </div>
        <div className="flex items-center gap-3">
          <Stamp teacherId={session.id} />
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            登出
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '全部', value: reflections.length, color: 'text-gray-700' },
          { label: '待批改', value: pending, color: 'text-orange-600' },
          { label: '已批閱', value: reviewed, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-red-100 p-4 text-center shadow-sm">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-2">
          {(['all', 'pending', 'reviewed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                filter === f
                  ? 'bg-red-700 text-white border-red-700'
                  : 'border-gray-200 text-gray-500 hover:border-red-300'
              }`}
            >
              {{ all: '全部', pending: '待批改', reviewed: '已批閱' }[f]}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋姓名、班級或心得內容…"
          className="flex-1 min-w-48 border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-red-400"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">載入中…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">無符合條件的心得</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-800">{r.name}</span>
                    <span className="text-sm text-gray-400">{r.class} · {r.seat_number}號</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.status === 'pending'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'bg-green-50 text-green-600 border border-green-200'
                    }`}>
                      {r.status === 'pending' ? '待批改' : `已批閱 · ${r.teacher_name}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{r.content}</p>
                  {r.teacher_comment && (
                    <p className="text-sm text-red-600 mt-1 line-clamp-1">💬 {r.teacher_comment}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSelected(r)}
                    className="px-4 py-1.5 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors"
                  >
                    {r.status === 'pending' ? '批改' : '查看'}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-3 py-1.5 border border-gray-200 text-gray-400 text-sm rounded-lg hover:text-red-500 hover:border-red-200 transition-colors"
                    title="隱藏"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && session && (
        <ReviewModal
          reflection={selected}
          session={session}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
