# 🌸 青銀共融心得系統

**115年度青銀共融一日照服小幫手體驗活動**  
永平高中 × 恆安住宿長照機構 · 民國115年6月10日

---

## 功能概覽

| 網頁 | 路徑 | 說明 |
|------|------|------|
| 學生心得填寫 | `/` | 填寫班級、座號、姓名、Email、心得 |
| 教師批改後台 | `/teacher` | 登入、批改、發送 Email 通知 |
| 心得展示牆 | `/showroom` | 公開展示已批閱心得（含紅色印章） |

---

## 技術棧

| 層次 | 技術 |
|------|------|
| 框架 | Next.js 14 (App Router) + TypeScript |
| 樣式 | Tailwind CSS |
| 資料庫 | Supabase (PostgreSQL) |
| Email | Resend |
| 部署 | Vercel（推薦）/ 任何支援 Node.js 的平台 |

---

## 資料庫 Schema

```sql
Table: reflections
  id            uuid           PK, auto-generated
  class         text           班級（例：高一仁）
  seat_number   text           座號
  name          text           學生姓名
  email         text           學生 Email
  content       text           服務心得
  status        text           pending | reviewed | hidden
  teacher_id    text           lulu | yichi
  teacher_name  text           老師顯示名稱
  teacher_comment text         老師回饋內容
  reviewed_at   timestamptz    批閱時間
  created_at    timestamptz    送出時間
```

---

## 本地運行

### 1. 安裝相依套件

```bash
cd 20260610-longcare
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入以下值：

| 變數 | 說明 | 取得方式 |
|------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公開金鑰 | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服務金鑰（機密）| 同上 |
| `RESEND_API_KEY` | Resend API 金鑰 | resend.com → API Keys |
| `RESEND_FROM` | 寄件人信箱（需在 Resend 驗證網域）| 自行設定 |
| `TEACHER_LULU_PASSWORD` | 盧盧老師登入密碼 | 自行設定 |
| `TEACHER_YICHI_PASSWORD` | 怡琪老師登入密碼 | 自行設定 |
| `NEXT_PUBLIC_APP_URL` | 網站公開 URL | 本地開發用 `http://localhost:3000` |

### 3. 建立 Supabase 資料表

前往 Supabase → SQL Editor，複製並執行 `supabase-schema.sql` 的內容。

### 4. 啟動開發伺服器

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)

---

## 部署至 Vercel

```bash
npm i -g vercel
vercel
```

將 `.env.local` 中的環境變數逐一填入 Vercel Dashboard → Settings → Environment Variables。

---

## 教師資訊

| 老師 | ID | Email | 印章文字 |
|------|-----|-------|---------|
| 盧盧老師 | `lulu` | d225@yphs.tw | 盧盧老師已批閱 |
| 怡琪老師 | `yichi` | yichi@yphs.tw | 怡琪老師已批閱 |

老師批改完成後，系統自動：
1. 更新心得狀態為「已批閱」
2. 發送 Email 給學生（含心得全文 + 老師回饋 + 紅色電子印章）
3. BCC 兩位老師（d225@yphs.tw、yichi@yphs.tw）

---

## 專案結構

```
src/
├── app/
│   ├── page.tsx              學生心得填寫頁
│   ├── teacher/page.tsx      教師批改後台
│   ├── showroom/page.tsx     心得展示牆
│   ├── layout.tsx            共用 Layout（導覽列、Footer）
│   └── api/
│       ├── submit/           POST 學生送出心得
│       ├── reflections/      GET 取得心得列表
│       ├── review/           POST 老師批改並發送 Email
│       ├── delete/           POST 隱藏心得
│       └── login/            POST 教師登入
├── components/
│   ├── Stamp.tsx             紅色電子印章元件（含蓋章動畫）
│   └── ReflectionCard.tsx    心得卡片元件
└── lib/
    ├── supabase.ts           Supabase 客戶端
    ├── email.ts              Resend Email 發送
    └── auth.ts               教師驗證邏輯
```
