-- Create `tasks` and `memories` tables (if missing) and enable RLS + policies.
-- Run this migration with the Supabase CLI (e.g. `supabase db push`) or paste into the SQL editor.

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text,
  status text,
  timer_minutes int,
  extensions int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  text text,
  type text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation: drop existing policies and recreate
DROP POLICY IF EXISTS tasks_user_is_owner ON public.tasks;
CREATE POLICY tasks_user_is_owner ON public.tasks
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS memories_user_is_owner ON public.memories;
CREATE POLICY memories_user_is_owner ON public.memories
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

-- Notes:
-- - `auth.uid()` returns the authenticated user's id (text).
-- - The Supabase `service_role` key and server-side functions bypass RLS. Keep `service_role` private.
-- - If you need admin panels, create additional policies that check `auth.role()` or a custom flag.
