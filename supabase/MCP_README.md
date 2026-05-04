# Supabase hosting + MCP notes

This repo includes a small Supabase deployment scaffold and a Model Context Protocol (MCP) function scaffold.

Files added:
- `supabase/migrations/001_enable_rls.sql` — enables RLS and creates owner policies for `tasks` and `memories`.
- `supabase/functions/mcp/index.ts` — a simple Supabase Edge Function scaffold for an MCP-compatible endpoint.

Quick setup and deploy

1. Install Supabase CLI: https://supabase.com/docs/guides/cli

2. Log in and link your project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

3. Push DB migrations (will create policies if tables exist):

```bash
supabase db push
```

4. Deploy functions (from repo root):

```bash
supabase functions deploy mcp --no-verify-jwt
```

Notes about security and RLS
- Keep the `service_role` key secret; do not bundle it into client code.
- The migration enables RLS and creates policies that require `auth.uid()` to match `user_id` on rows.
- If you need server-side operations that bypass RLS, call them from Functions using the `service_role` key (set as a secret in Supabase).

Using MCP function
- The scaffold returns a simple JSON echo. Replace the handler body with calls to your model provider and return MCP-compliant responses.
- Protect sensitive operations by requiring JWT verification in the function and checking `context.user` (or use `supabase.auth.getUser()` inside the function).
