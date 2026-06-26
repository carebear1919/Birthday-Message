-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Creates the database schema for the Scrapbook Birthday Wall

-- 1. Birthday Pages table
create table birthday_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  celebrant_name text not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- 2. Messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references birthday_pages(id) on delete cascade,
  sender_name text not null,
  message_text text not null,
  photo_url text,
  rotation_deg int default 0,
  layout_template int default 1,
  created_at timestamptz default now()
);

-- 3. Enable Row Level Security
alter table birthday_pages enable row level security;
alter table messages enable row level security;

-- 4. RLS: Public can SELECT birthday_pages (client only requests slug/celebrant_name)
create policy "Public can view birthday pages"
  on birthday_pages for select
  using (true);

-- 4b. RLS: Public can INSERT birthday_pages (anyone can create a wall)
create policy "Public can create birthday pages"
  on birthday_pages for insert
  with check (true);

-- 5. RLS: Public can INSERT messages (but never SELECT them)
create policy "Public can insert messages"
  on messages for insert
  with check (true);

-- 6. Storage bucket for photos (run in Storage > Create bucket or via SQL)
-- Bucket name: birthday-photos
-- Make it public so the URL is directly accessible

-- Note: The service_role key (server-side) bypasses all RLS
-- and is used only in server actions to read password_hash and messages.
-- The anon key (client-side) can only query birthday_pages (slug, celebrant_name)
-- and insert into messages — never read messages directly.
