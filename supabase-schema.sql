-- Run this in the Supabase SQL Editor to set up the database

create table if not exists reflections (
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

-- Index for fast status queries
create index if not exists idx_reflections_status on reflections (status);
create index if not exists idx_reflections_created_at on reflections (created_at desc);

-- Row-Level Security: public can only read reviewed rows (no email/seat_number)
alter table reflections enable row level security;

create policy "Public read reviewed"
  on reflections for select
  using (status = 'reviewed');

-- Service role bypasses RLS (used by our API routes with service key)
