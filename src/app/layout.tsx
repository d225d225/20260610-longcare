import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '青銀共融 — 學生服務心得',
  description: '115年度青銀共融一日照服小幫手體驗活動 · 永平高中',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-[#fffaf7]">
        <nav className="bg-white border-b border-red-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-6 text-sm">
            <span className="font-bold text-red-800 text-base">🌸 青銀共融心得系統</span>
            <a href="/" className="text-gray-600 hover:text-red-700 transition-colors">填寫心得</a>
            <a href="/showroom" className="text-gray-600 hover:text-red-700 transition-colors">心得展示牆</a>
            <a href="/teacher" className="ml-auto text-gray-400 hover:text-red-600 transition-colors text-xs">教師後台</a>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-8 border-t border-red-50 mt-16">
          115年度青銀共融一日照服小幫手體驗活動 · 永平高中 × 恆安住宿長照機構
        </footer>
      </body>
    </html>
  )
}
