'use client'
import { useEffect, useState } from 'react'
import ReflectionCard from '@/components/ReflectionCard'
import type { Reflection } from '@/lib/supabase'

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('teacher_token') ?? '' : ''
}
function getTeacherId() {
  return typeof window !== 'undefined' ? localStorage.getItem('teacher_id') ?? '' : ''
}

export default function Showroom() {
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)
  const [isTeacher, setIsTeacher] = useState(false)

  async function load() {
    const token = getToken()
    setIsTeacher(!!token)
    const res = await fetch('/api/reflections', {
      headers: token ? { 'x-teacher-token': token } : {},
    })
    const data = await res.json()
    setReflections(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('確定要隱藏這份心得？')) return
    const token = getToken()
    await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-teacher-token': token },
      body: JSON.stringify({ reflectionId: id }),
    })
    setReflections(prev => prev.filter(r => r.id !== id))
  }

  const reviewed = reflections.filter(r => !r.status || r.status === 'reviewed')
  const pending = reflections.filter(r => r.status === 'pending')

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-red-800 mb-2">心得展示牆</h1>
        <p className="text-gray-500 text-sm">115年度青銀共融一日照服小幫手體驗活動</p>
        <p className="text-gray-400 text-xs mt-1">共 {reviewed.length} 份已批閱心得</p>
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-400">載入中…</div>
      )}

      {!loading && reviewed.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">📋</div>
          <p>尚無已批閱的心得，請稍後再來！</p>
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div className="columns-1 sm:columns-2 gap-5 space-y-5">
          {reviewed.map(r => (
            <div key={r.id} className="break-inside-avoid">
              <ReflectionCard
                reflection={r}
                onDelete={isTeacher ? handleDelete : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pending - only visible to teacher */}
      {isTeacher && pending.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-400 mb-4 border-t border-dashed border-gray-200 pt-6">
            待批改心得（僅老師可見）
          </h2>
          <div className="columns-1 sm:columns-2 gap-5 space-y-5">
            {pending.map(r => (
              <div key={r.id} className="break-inside-avoid">
                <ReflectionCard reflection={r} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
