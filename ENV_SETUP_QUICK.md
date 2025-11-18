# Quick Environment Setup Guide

## ✅ Fixed: Preview Error Resolved

The app now works **without Supabase credentials** using mock data. The error has been fixed!

## 🚀 Current Status

- ✅ App will start without Supabase environment variables
- ✅ Uses mock data automatically when Supabase is not configured
- ✅ Console warning will show instructions if env vars are missing

## 📝 To Enable Supabase (Optional)

When you're ready to connect to a real Supabase database:

### Step 1: Create Environment Files

Create these files in your project:

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**`apps/admin/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Restart Dev Server

After creating the `.env.local` files:
```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
pnpm dev
```

## 📚 Full Setup Documentation

For complete Supabase setup including database schema and sample data, see:
- `QUICK_SUPABASE_SETUP.md` - Quick copy-paste SQL setup
- `ENV_SETUP.md` - Detailed environment variable guide
- `SUPABASE_INTEGRATION.md` - Complete integration guide

## 🎯 What Works Now

- ✅ App preview works without Supabase
- ✅ Mock data is used automatically
- ✅ No errors on startup
- ✅ All features work with mock data
- ✅ Ready to connect to Supabase when needed

