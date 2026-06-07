# claude.md — 開發記錄與重要事項

## 建立日期：2026-06-07

---

## 專案概述

**活動名稱**：115年度青銀共融一日照服小幫手體驗活動
**活動日期**：民國115年6月10日（星期三）
**主辦**：恆安住宿長照機構
**協辦**：永平高中
**參加人數**：約35人
**線上網址**：https://20260610-longcare.vercel.app
**GitHub**：https://github.com/d225d225/20260610-longcare

---

## 帳號與服務清單

| 服務 | 帳號 | 用途 |
|------|------|------|
| GitHub | d225d225 | 程式碼儲存庫 |
| Vercel | d225-6222's projects | 網站部署 |
| Supabase | d225d225's Org | 資料庫 |
| Gmail SMTP | d225@yphs.tw | 寄送 Email 通知 |

---

## 重要密碼與金鑰（請妥善保管）

### 教師後台密碼
- 盧盧老師（lulu）：存於 Vercel 環境變數 `TEACHER_LULU_PASSWORD`
- 怡琪老師（yichi）：存於 Vercel 環境變數 `TEACHER_YICHI_PASSWORD`
- 預設值：`lulu2026` / `yichi2026`（建議活動前更改）

### Supabase
- 專案 URL：`https://xgzhmidqhrjznjejuujn.supabase.co`
- Database Password：`VkzMD93CC8QwvB7x`（保存於安全處）
- ⚠️ 需使用 **Legacy** key（JWT 格式，`eyJ...` 開頭），非新版 `sb_publishable_*`

### Gmail App Password
- 帳號：`d225@yphs.tw`
- App Password：存於 Vercel 環境變數 `GMAIL_APP_PASSWORD`
- 重新產生：myaccount.google.com/apppasswords

---

## 已解決的關鍵問題（未來維護參考）

### 1. Supabase Key 格式問題
- **現象**：送出心得時顯示「送出失敗」
- **原因**：新版 `sb_publishable_*` / `sb_secret_*` key 格式與 `@supabase/supabase-js` v2.43.4 不相容
- **解法**：改用 Settings → API Keys → **Legacy anon, service_role API keys** 頁籤的 JWT 格式 key

### 2. Supabase 權限問題
- **現象**：service_role 無法寫入資料表，回傳 `permission denied (42501)`
- **解法**：在 SQL Editor 執行：
  ```sql
  GRANT ALL ON public.reflections TO service_role;
  GRANT ALL ON public.reflections TO anon;
  GRANT ALL ON public.reflections TO authenticated;
  ```

### 3. Email 無法寄給學生
- **現象**：Resend `onboarding@resend.dev` 只能寄給帳號綁定信箱
- **解法**：改用 Gmail SMTP（nodemailer），帳號 `d225@yphs.tw` + App Password

### 4. next.config.ts 不支援
- **現象**：`npm run dev` 報錯 `next.config.ts is not supported`
- **解法**：改名為 `next.config.mjs`

### 5. Resend 延遲初始化
- **現象**：build 時報錯 `Missing API key`
- **解法**：在函式內部初始化 Resend，而非模組層級

---

## 兩位老師規格

| 欄位 | 盧盧老師 | 怡琪老師 |
|------|---------|---------|
| ID | `lulu` | `yichi` |
| Email | d225@yphs.tw | yichi@yphs.tw |
| 印章文字 | 盧盧老師已批閱 | 怡琪老師已批閱 |

---

## 電子印章規格

- 形狀：圓形邊框（border-radius: 50%）
- 顏色：`#c0392b`（深紅）
- 傾斜：`-12deg`
- 動畫：scale(2.5) → scale(1)，0.4s，cubic-bezier(0.175, 0.885, 0.32, 1.275)
- 文字：`✦ / {老師名稱} / 已批閱 / ✦`

---

## 更新程式碼後部署方式

```bash
cd ~/Downloads/20260610-longcare
# 修改程式碼後
vercel --prod
```

若需更新環境變數：
```bash
vercel env rm 變數名稱 production --yes
echo "新的值" | vercel env add 變數名稱 production
vercel --prod
```

---

## 資料庫 Schema

```sql
create table reflections (
  id           uuid primary key default gen_random_uuid(),
  class        text not null,
  seat_number  text not null,
  name         text not null,
  email        text not null,
  content      text not null,
  status       text not null default 'pending'
                 check (status in ('pending', 'reviewed', 'hidden')),
  teacher_id   text check (teacher_id in ('lulu', 'yichi')),
  teacher_name text,
  teacher_comment text,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);
```
