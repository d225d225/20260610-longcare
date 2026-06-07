# 🌸 青銀共融心得系統

**115年度青銀共融一日照服小幫手體驗活動**  
永平高中 × 恆安住宿長照機構 · 民國115年6月10日

🌐 **線上網址**：https://20260610-longcare.vercel.app

---

## 網頁功能

| 網址 | 功能 |
|------|------|
| `/` | 學生填寫服務心得 |
| `/teacher` | 教師批改後台（需密碼登入） |
| `/showroom` | 心得展示牆（公開） |

---

## 技術棧

| 層次 | 技術 |
|------|------|
| 框架 | Next.js 14 (App Router) + TypeScript |
| 樣式 | Tailwind CSS |
| 資料庫 | Supabase (PostgreSQL) |
| Email | Gmail SMTP（nodemailer） |
| 部署 | Vercel |

---

## 資料庫 Schema

```sql
Table: reflections
  id              uuid           PK, auto-generated
  class           text           班級（自由輸入）
  seat_number     text           座號
  name            text           學生姓名
  email           text           學生 Email（不對外公開）
  content         text           服務心得（最多 500 字）
  status          text           pending | reviewed | hidden
  teacher_id      text           lulu | yichi
  teacher_name    text           老師顯示名稱
  teacher_comment text           老師回饋內容
  reviewed_at     timestamptz    批閱時間
  created_at      timestamptz    送出時間
```

---

## 教師資訊

| 老師 | ID | Email | 印章 |
|------|-----|-------|------|
| 盧盧老師 | `lulu` | d225@yphs.tw | 盧盧老師已批閱 |
| 怡琪老師 | `yichi` | yichi@yphs.tw | 怡琪老師已批閱 |

老師批改完成後系統自動：
1. 更新心得狀態為「已批閱」
2. 發送 Email 給學生（含心得全文 + 老師回饋 + 紅色電子印章）
3. BCC 兩位老師（d225@yphs.tw、yichi@yphs.tw）

---

## 本地開發

```bash
# 安裝相依套件
npm install

# 複製環境變數範本
cp .env.example .env.local
# 填入 .env.local 所有值（見下方說明）

# 啟動開發伺服器
npm run dev
```

打開 http://localhost:3000

---

## 環境變數說明（.env.local）

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Legacy anon key（JWT 格式） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Legacy service_role key（JWT 格式） |
| `GMAIL_USER` | 寄件 Gmail 帳號（d225@yphs.tw） |
| `GMAIL_APP_PASSWORD` | Gmail 應用程式密碼（16碼，myaccount.google.com/apppasswords） |
| `TEACHER_LULU_PASSWORD` | 盧盧老師登入密碼 |
| `TEACHER_YICHI_PASSWORD` | 怡琪老師登入密碼 |
| `NEXT_PUBLIC_APP_URL` | 網站公開 URL |

> ⚠️ **重要**：Supabase 需使用 **Legacy** anon/service_role key（JWT 格式，`eyJ...` 開頭），
> 新版 `sb_publishable_*` / `sb_secret_*` 格式與本專案 SDK 版本不相容。

---

## Supabase 初始化

建立專案後在 SQL Editor 執行 `supabase-schema.sql`，並額外執行：

```sql
GRANT ALL ON public.reflections TO service_role;
GRANT ALL ON public.reflections TO anon;
GRANT ALL ON public.reflections TO authenticated;
```

---

## 部署至 Vercel

```bash
npm i -g vercel
cd 20260610-longcare
vercel --prod
```

環境變數需在 Vercel Dashboard 或 CLI 逐一設定：

```bash
echo "值" | vercel env add 變數名稱 production
```

---

## 專案結構

```
src/
├── app/
│   ├── page.tsx              學生心得填寫頁
│   ├── teacher/page.tsx      教師批改後台
│   ├── showroom/page.tsx     心得展示牆
│   ├── layout.tsx            共用 Layout
│   └── api/
│       ├── submit/           POST 學生送出心得
│       ├── reflections/      GET 取得心得列表
│       ├── review/           POST 老師批改並發送 Email
│       ├── delete/           POST 隱藏心得
│       └── login/            POST 教師登入
├── components/
│   ├── Stamp.tsx             紅色電子印章（含蓋章動畫）
│   └── ReflectionCard.tsx    心得卡片
└── lib/
    ├── supabase.ts           Supabase 客戶端
    ├── email.ts              Gmail SMTP 發信
    └── auth.ts               教師驗證
```
