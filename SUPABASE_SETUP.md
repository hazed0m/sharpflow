# Supabase Setup Guide

## Overview
Your SharpFlow project is almost ready! The logout button and auth flows are already implemented. You just need to:

1. Create a Supabase project
2. Add credentials to `.env.local`
3. Apply the database migration
4. (Optional) Configure Google OAuth

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Create a new project:
   - Click "New project"
   - Give it a name (e.g., "SharpFlow")
   - Create a strong database password and **save it securely**
   - Choose a region close to your users
   - Click "Create new project"
3. Wait for the project to be created (2-3 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings → API** (top-left corner)
2. Copy these two values:
   - **Project URL** → starts with `https://`
   - **Anon Public Key** → long string starting with `eyJ...`
3. Paste them into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. **Save** `.env.local` and restart your dev server

### 3. Apply the Database Migration

The database schema (tasks, memories tables with RLS) is defined in `supabase/migrations/001_enable_rls.sql`.

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install CLI if you don't have it
npm install -g supabase

# Authenticate with Supabase
supabase login

# Link your local project to the remote Supabase project
supabase link --project-ref your-project-ref

# Push migrations to your remote database
supabase db push
```

#### Option B: Manual SQL (Quick)

1. Go to your Supabase dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Open `supabase/migrations/001_enable_rls.sql` from your project
5. Copy the entire SQL content
6. Paste it into the SQL query editor
7. Click **Run** (or Cmd+Enter)
8. You should see a success message

### 4. Enable Google OAuth (Optional, for Sign in with Google)

If you want to support "Sign in with Google":

1. Go to **Authentication → Providers** in Supabase dashboard
2. Find "Google" and click **Enable**
3. Follow the setup instructions to create a Google OAuth application
4. Add the Client ID and Secret to the Supabase provider config
5. Add your callback URLs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourapp.com/auth/callback`

### 5. Test Your Setup

1. Make sure your dev server is running: `npm run dev`
2. Open `http://localhost:5173`
3. Try signing in with email - you should get a magic link
4. Check your email for the sign-in link
5. Click it and you should be logged in
6. You should see the **Sign out** button appear
7. Try clicking **Sign out** - it should work

## Troubleshooting

### "Supabase is not configured"
- Check that `.env.local` exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Restart your dev server after creating/editing `.env.local`

### "Email sign-in not working"
- Check that email authentication is enabled in **Authentication → Providers** (it should be by default)
- Make sure you use a real email address
- Check your spam folder for the sign-in link
- Verify the callback URL matches your dev server

### "Database errors when saving tasks/memories"
- Run the migration again using one of the methods above
- Check that RLS is enabled (should be in the migration)
- Make sure you're signed in as an authenticated user

### "Sign out button doesn't appear"
- Verify Supabase credentials are correct
- Check browser console for errors
- Make sure you're successfully logged in first

## What's Already Set Up

✅ Auth flows (email + Google login)  
✅ Logout button (visible after login)  
✅ Database schema (tasks, memories tables) — **deployed ✓**  
✅ Row-level security (RLS policies) — **verified ✓**  
✅ Auth state persistence  
✅ Type-safe Supabase client  
✅ Project linked to Supabase: `wuggucdwlannodhuukvf`  

## Google OAuth Setup (do this now)

To enable "Sign in with Google", configure the provider in your Supabase dashboard:

### Step 1: Create a Google Cloud OAuth 2.0 client

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to **APIs & Services → OAuth consent screen**
   - Choose "External" user type
   - Add your email as a test user
   - Add scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: "SharpFlow" (or any name)
   - **Authorized redirect URIs** — add:
     - `http://localhost:5173` (development)
     - `https://wuggucdwlannodhuukvf.supabase.co/auth/v1/callback`
   - Click **Create**
5. Copy the **Client ID** and **Client Secret**

### Step 2: Configure in Supabase Dashboard

1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard/project/wuggucdwlannodhuukvf)
2. Navigate to **Authentication → Providers**
3. Find **Google** and toggle it **Enabled**
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

### Step 3: Test

1. Start your dev server: `npm run dev`
2. Open `http://localhost:5173`
3. Click **Sign in with Google**
4. You should be redirected to Google, then back to your app logged in

## Database Schema

### `tasks` table
```sql
- id (UUID, primary key)
- user_id (UUID, references auth.users)
- title (text)
- status (text)
- timer_minutes (int)
- extensions (int)
- created_at (timestamp)
```

### `memories` table
```sql
- id (UUID, primary key)
- user_id (UUID, references auth.users)
- text (text)
- type (text)
- created_at (timestamp)
```

Both tables have RLS enabled so users can only see/modify their own data.

## Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
