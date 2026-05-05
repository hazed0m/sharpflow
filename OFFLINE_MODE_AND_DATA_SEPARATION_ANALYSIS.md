# Offline Mode & Data Separation Analysis

## Current State

### 1. Offline Mode Configuration

**Location:** `src/features/auth/AuthGate.tsx` (lines 21-22)

```typescript
const isOfflineMode = !supabase
```

This checks if the Supabase client was created successfully. If credentials are missing or invalid, it shows an "Offline mode enabled" banner.

**Current `.env` file:**
```
VITE_SUPABASE_URL=https://wuggucdwlannodhuukvf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_JXM5h1v1zWfDvtWxqbYu3Q_O-stceRw
```

### 2. Data Separation Mechanism

**Location:** `src/store/useSharpFlowStore.ts` (lines 10-14)

The app uses **two separate storage strategies**:

#### Guest Users (No Auth)
- Storage key: `sharpflow-guest-state-v1`
- All guests share the same localStorage data
- No Supabase sync - purely local

#### OAuth Users (With Auth)
- Each user gets their own localStorage keys: `sharpflow-oauth-{userId}`
- Data is synced to Supabase database
- **BUT** localStorage still stores a copy for offline resilience

## Potential Issues After Code Changes

### Issue 1: Offline Mode Banner Appearing Again

If you see the "Offline mode enabled" banner after code changes, it means:

1. **Environment variables not loaded**: The `.env` file might have been modified or deleted
2. **Build cache issue**: Vite cached old build without credentials
3. **Supabase project changed**: URL or key was updated in Supabase dashboard

**Fix:**
```bash
# Clear Vite cache and rebuild
rm -rf node_modules/.vite dist
npm run dev
```

### Issue 2: Data Separation Not Working Correctly

After code changes, you might experience:

1. **Data mixing between users**: OAuth user data appearing in guest localStorage or vice versa
2. **Lost local data after auth**: LocalStorage data not syncing properly to Supabase
3. **Guest data persisting across sessions**: Different guests seeing each other's data

## Root Cause Analysis

### The Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Guest User    │────▶│  localStorage    │────▶│  No Supabase    │
│  (shared key)   │     │  sharpflow-      │     │  sync           │
└─────────────────┘     │  guest-state-v1  │     └─────────────────┘
                        └──────────────────┘
                              │
                              ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   OAuth User    │────▶│  localStorage    │◀────│  Supabase DB    │
│  (user-specific)│     │  sharpflow-      │     │  tasks/memories │
│                 │     │  oauth-{userId}  │     └─────────────────┘
└─────────────────┘     └──────────────────┘
                              ▲
```

### What Can Go Wrong After Code Changes

1. **Migration script changed**: If you modified the database schema, old localStorage data might not match new schema expectations
2. **Storage key changed**: If `GUEST_STORAGE_KEY` constant was updated, old guest data becomes orphaned
3. **Sync logic broken**: The `initializeUser()` function might fail to fetch from Supabase correctly

## Recommended Fixes

### Fix 1: Verify Environment Variables

Check that `.env.local` exists and has valid credentials:

```bash
# Check if .env.local exists
ls -la .env.local

# View contents (be careful with sensitive data)
cat .env.local | grep SUPABASE
```

If missing, copy from `.env.example`:
```bash
cp .env.example .env.local
nano .env.local  # Edit with your credentials
```

### Fix 2: Clear Vite Cache and Rebuild

```bash
# Stop the dev server (Ctrl+C)
rm -rf node_modules/.vite dist
npm run dev
```

### Fix 3: Verify Supabase Connection

Run this test script to check connectivity:

```bash
node scripts/test-supabase-connection.js
```

Expected output:
```
✅ Session active: user@example.com
✅ Database accessible, tasks count: 0
```

If you see errors, the issue is likely:
- Invalid API key (check Supabase dashboard)
- CORS restrictions on your Supabase project
- Network connectivity issues

### Fix 4: Check Data Separation in Browser DevTools

1. Open browser DevTools → Application tab
2. Look at `localStorage`
3. You should see keys like:
   - `sharpflow-guest-state-v1` (shared guest data)
   - `sharpflow-oauth-{your-user-id}` (your personal data)

If you see unexpected keys or mixed data, the storage separation is broken.

### Fix 5: Reset LocalStorage (if needed)

```javascript
// In browser console:
localStorage.clear()
location.reload()
```

## Verification Steps

1. **Test offline mode**: Disconnect internet → reload page → should show "Offline mode enabled" banner
2. **Test data separation**: Sign in with OAuth → check localStorage keys change from guest to oauth-{userId}
3. **Test sync**: Add a task while online → disconnect → add another task → reconnect → verify both tasks appear

## Summary

The offline mode and data separation are working as designed:
- Guest users share localStorage (no Supabase)
- OAuth users have user-specific localStorage + Supabase sync
- The "Offline mode enabled" banner only appears when credentials are missing or invalid

If issues persist after code changes, the most likely causes are:
1. Environment variables not loaded correctly
2. Vite build cache stale
3. Supabase project configuration changed

Run `npm run dev` with a clean cache to resolve most issues.