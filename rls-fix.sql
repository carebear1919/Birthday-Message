-- Fix RLS: allow public INSERT to messages (run if you still get the error)
create policy "Public can insert messages"
  on messages for insert
  with check (true);

-- Allow public uploads to storage bucket
create policy "Public can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'birthday-photos');

create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'birthday-photos');
