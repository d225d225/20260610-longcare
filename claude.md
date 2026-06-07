# claude.md — 開發記錄

## 建立日期：2026-06-07

---

## 專案概述

**活動名稱**：115年度青銀共融一日照服小幫手體驗活動  
**活動日期**：民國115年6月10日（星期三）  
**主辦**：恆安住宿長照機構  
**協辦**：永平高中  
**參加人數**：約35人  
**GitHub Repo**：`d225d225/20260610-longcare`  
**推送帳號**：`d225d225`（`gh auth switch --user d225d225`）

---

## 技術架構決定

### 為何選擇 Next.js App Router

- API Routes 與前端同倉庫，部署一次搞定（Vercel）
- Server Components 減少前端 JS bundle
- 無需額外後端伺服器

### 為何選擇 Supabase

- 免費方案足夠活動規模（35人）
- 內建 RLS（Row-Level Security）保護 Email 等敏感欄位不被公開 API 洩漏
- Postgres 支援，未來可擴充

### 為何選擇 Resend

- Developer-friendly API，比 SendGrid 設定更簡單
- 免費方案每月 3,000 封，遠超需求

### 教師認證方式

- 使用環境變數儲存密碼（不建 teacher 資料表）
- Token = `base64(id:password)`，由 API Route 解碼驗證
- Session 存於 `localStorage`（非生產級 auth，但符合活動規模需求）
- **不使用 JWT**：避免 secret 管理複雜度

---

## 重要規格

### 兩位老師

| 欄位 | 盧盧老師 | 怡琪老師 |
|------|---------|---------|
| ID | `lulu` | `yichi` |
| Email | d225@yphs.tw | yichi@yphs.tw |
| 印章文字 | 盧盧老師已批閱 | 怡琪老師已批閱 |
| 密碼環境變數 | `TEACHER_LULU_PASSWORD` | `TEACHER_YICHI_PASSWORD` |

### 紅色電子印章規格

- 形狀：圓形邊框（`border-radius: 50%`）
- 顏色：`#c0392b`（深紅）
- 傾斜：`-12deg`（順時針12度）
- 動畫：`scale(2.5) → scale(1)`，時長 0.4s，easing: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`
- 文字：`✦ / {老師名稱} / 已批閱 / ✦`
- 字體：Noto Serif TC（印章感）

### Email 通知規格

- 收件人：學生 Email
- BCC：d225@yphs.tw、yichi@yphs.tw（兩位老師皆收到）
- 內容：學生心得全文 + 老師回饋 + HTML 印章
- 發送時機：老師點擊「儲存並發送通知」後

### 資料安全

- 學生 Email、座號不對外公開（公開 API 不回傳這些欄位）
- Supabase RLS：公開查詢只能讀 `status = 'reviewed'` 的資料
- 服務金鑰僅在 API Route（Server Side）使用，不暴露至前端
- 心得內容有 XSS 防護（Email 模板使用 `escHtml()`）

---

## 資料庫 Schema

```
Table: reflections
  id            uuid           PK
  class         text           班級
  seat_number   text           座號
  name          text           姓名
  email         text           Email（不對外公開）
  content       text           心得內容（最多500字）
  status        text           pending | reviewed | hidden
  teacher_id    text           lulu | yichi
  teacher_name  text           批改老師顯示名稱
  teacher_comment text         老師回饋
  reviewed_at   timestamptz    批閱時間
  created_at    timestamptz    送出時間
```

---

## 待辦事項

- [ ] 建立 Supabase 專案並執行 `supabase-schema.sql`
- [ ] 設定 Resend 帳號，驗證寄件網域
- [ ] 填寫 `.env.local` 所有環境變數
- [ ] 設定兩位老師密碼（`TEACHER_LULU_PASSWORD`, `TEACHER_YICHI_PASSWORD`）
- [ ] 推送至 `d225d225/20260610-longcare`（先至 GitHub 建立空 Repo）
- [ ] 部署至 Vercel 並設定環境變數

---

## 已知限制

1. 教師認證為簡易密碼機制，非企業級 auth（活動規模足夠）
2. 心得修改後無法撤回通知 Email
3. 學生無法自行刪除或修改心得（需老師操作）
