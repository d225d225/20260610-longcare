'use client'
import { useState } from 'react'

export default function StudentForm() {
  const [form, setForm] = useState({
    class: '', seat_number: '', name: '', email: '', content: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  function validate() {
    const e: Record<string, string> = {}
    if (!form.class) e.class = '請選擇班級'
    if (!form.seat_number) e.seat_number = '請填寫座號'
    if (!form.name) e.name = '請填寫姓名'
    if (!form.email) e.email = '請填寫 Email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email 格式不正確'
    if (!form.content) e.content = '請填寫心得'
    else if (form.content.length < 30) e.content = '心得至少需填寫 30 字'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStatus('submitting')

    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setStatus('success')
      setForm({ class: '', seat_number: '', name: '', email: '', content: '' })
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="text-6xl mb-6">🌸</div>
        <h2 className="text-2xl font-bold text-red-800 mb-3">心得已成功送出！</h2>
        <p className="text-gray-600 mb-8">老師批閱後，系統將發送通知至你的 Email。</p>
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-2 bg-red-700 text-white rounded-full hover:bg-red-800 transition-colors"
        >
          再填一份
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-red-800 mb-2">服務心得填寫</h1>
        <p className="text-gray-500 text-sm">
          115年度青銀共融一日照服小幫手體驗活動 · 民國115年6月10日
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-red-100 p-8 space-y-5">
        {/* 班級 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">班級 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.class}
            onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
            placeholder="例：高一仁、高二義"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
          />
          {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
        </div>

        {/* 座號 + 姓名 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">座號 <span className="text-red-500">*</span></label>
            <input
              type="number" min="1" max="50"
              value={form.seat_number}
              onChange={e => setForm(f => ({ ...f, seat_number: e.target.value }))}
              placeholder="例：18"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
            />
            {errors.seat_number && <p className="text-red-500 text-xs mt-1">{errors.seat_number}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="請填寫真實姓名"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="老師批閱後將寄送通知至此信箱"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* 心得 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            服務心得 <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-2">（至少 30 字，最多 500 字）</span>
          </label>
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value.slice(0, 500) }))}
            placeholder="請描述今天在恆安機構的服務經歷、與長輩的互動，以及你的感受與收穫……"
            rows={7}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.content
              ? <p className="text-red-500 text-xs">{errors.content}</p>
              : <span />}
            <span className={`text-xs ${form.content.length > 450 ? 'text-orange-500' : 'text-gray-400'}`}>
              {form.content.length} / 500
            </span>
          </div>
        </div>

        {status === 'error' && (
          <p className="text-red-500 text-sm text-center">送出失敗，請稍後再試。</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 disabled:opacity-50 transition-colors"
        >
          {status === 'submitting' ? '送出中…' : '送出心得'}
        </button>
      </form>
    </div>
  )
}
