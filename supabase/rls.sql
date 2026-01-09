-- Step 5: Row Level Security (RLS) policies
-- Run in Supabase Dashboard → SQL Editor

alter table public.notes enable row level security;

-- Read: users can only read their own notes
create policy "notes_select_own"
on public.notes
for select
using (auth.uid() = user_id);

-- Create: users can only create notes for themselves
create policy "notes_insert_own"
on public.notes
for insert
with check (auth.uid() = user_id);

-- Delete: users can only delete their own notes
create policy "notes_delete_own"
on public.notes
for delete
using (auth.uid() = user_id);
