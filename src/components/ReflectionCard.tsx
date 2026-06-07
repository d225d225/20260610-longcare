'use client'
import Stamp from './Stamp'
import type { Reflection } from '@/lib/supabase'

type Props = {
  reflection: Reflection
  onDelete?: (id: string) => void
}

export default function ReflectionCard({ reflection: r, onDelete }: Props) {
  const date = new Date(r.created_at).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="relative bg-white rounded-2xl shadow-md border border-red-100 p-6 overflow-hidden">
      {/* header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">{r.name}</p>
          <p className="text-sm text-gray-500">{r.class} · {r.seat_number}號 · {date}</p>
        </div>

        {/* 印章區：最多兩個 */}
        <div className="flex gap-2 shrink-0 ml-4">
          {r.teacher_id && (
            <Stamp teacherId={r.teacher_id} animate />
          )}
          {r.teacher2_id && (
            <Stamp teacherId={r.teacher2_id} animate />
          )}
        </div>
      </div>

      {/* 心得內容 */}
      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed border-l-2 border-red-100 pl-3">
        {r.content}
      </p>

      {/* 第一位老師回饋 */}
      {r.teacher_comment && (
        <div className="mt-4 bg-red-50 rounded-lg p-3">
          <p className="text-xs text-red-500 font-semibold mb-1">
            {r.teacher_name ?? '老師'} 的回饋
          </p>
          <p className="text-red-700 text-sm whitespace-pre-wrap">{r.teacher_comment}</p>
        </div>
      )}

      {/* 第二位老師回饋 */}
      {r.teacher2_comment && (
        <div className="mt-3 bg-red-50 rounded-lg p-3">
          <p className="text-xs text-red-500 font-semibold mb-1">
            {r.teacher2_name ?? '老師'} 的回饋
          </p>
          <p className="text-red-700 text-sm whitespace-pre-wrap">{r.teacher2_comment}</p>
        </div>
      )}

      {/* 刪除按鈕（老師用） */}
      {onDelete && (
        <button
          onClick={() => onDelete(r.id)}
          className="absolute top-3 right-3 text-xs text-gray-300 hover:text-red-400 transition-colors"
          title="隱藏此心得"
        >
          ✕
        </button>
      )}
    </div>
  )
}
