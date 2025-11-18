# Environment Variables Setup

## Required Environment Variables

Both the frontend (web) and admin panel require Supabase configuration.

### Frontend (apps/web)

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Admin Panel (apps/admin)

Create `apps/admin/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Optional Environment Variables

### Sentry (Error Tracking)

If you want to use Sentry for error tracking, add to `apps/web/.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

**Note**: Sentry is optional. The app will work without it.

### Google Analytics

If you want to use Google Analytics, add to `apps/web/.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Quick Start

1. Copy the example files:
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   cp apps/admin/.env.local.example apps/admin/.env.local
   ```

2. Edit both `.env.local` files and add your Supabase credentials

3. Restart the dev servers:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Error: "supabaseUrl is required"
- Make sure you've created `.env.local` in the correct app directory
- Verify the environment variable names are correct (case-sensitive)
- Restart the dev server after creating/modifying `.env.local`

### Error: "Module not found: Can't resolve '@sentry/nextjs'"
- This is now fixed! Sentry is optional and won't cause build errors
- If you want to use Sentry, install it: `npm install @sentry/nextjs` in `apps/web`

