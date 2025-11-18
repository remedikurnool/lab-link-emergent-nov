# Lab Link - Deployment Guide

## Overview

This guide covers deploying Lab Link to staging and production environments.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account (for frontend deployment)
- Supabase project (for backend)
- GitHub repository with GitHub Actions enabled

## Environment Setup

### 1. Staging Environment

1. Copy `.env.staging.example` to `.env.staging`
2. Fill in all required environment variables
3. Set up Supabase staging project
4. Configure Vercel staging projects

### 2. Production Environment

1. Copy `.env.production.example` to `.env.production`
2. Fill in all production credentials
3. Set up Supabase production project
4. Configure Vercel production projects

## Deployment Process

### Automatic Deployment (CI/CD)

#### Staging Deployment
- Triggered on push to `develop` branch
- Runs tests before deployment
- Deploys to staging environment
- Runs database migrations

#### Production Deployment
- Triggered on push to `main` branch
- Requires manual approval (if configured)
- Runs full test suite
- Deploys to production
- Creates release tag

### Manual Deployment

#### 1. Build Applications

```bash
# Build web app
cd apps/web
npm run build

# Build admin app
cd apps/admin
npm run build
```

#### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy web app
cd apps/web
vercel --prod

# Deploy admin app
cd apps/admin
vercel --prod
```

#### 3. Run Database Migrations

```bash
# Using Supabase CLI
npx supabase db push

# Or using SQL Editor in Supabase Dashboard
# Copy migration files and run in SQL Editor
```

## Database Migrations

### Running Migrations

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Copy migration SQL
   - Execute in order

2. **Via Supabase CLI:**
   ```bash
   npx supabase db push
   ```

3. **Via GitHub Actions:**
   - Migrations run automatically on deployment
   - Check workflow logs for status

### Migration Order

1. `001_initial_schema.sql`
2. `002_partners_and_bookings.sql`
3. `003_storage_and_settings.sql`
4. `004_payment_tracking.sql`
5. `005_notification_settings.sql`
6. `006_audit_logs.sql`
7. `009_slots_management.sql`
8. `010_notifications.sql`

## Post-Deployment Checklist

### Staging
- [ ] Verify all environment variables are set
- [ ] Test booking flow
- [ ] Test payment integration (test mode)
- [ ] Verify notifications are working
- [ ] Check error tracking
- [ ] Verify database migrations applied

### Production
- [ ] Verify all production credentials
- [ ] Test critical user flows
- [ ] Verify payment integration (live mode)
- [ ] Check monitoring and alerts
- [ ] Verify backups are configured
- [ ] Test rollback procedure

## Rollback Procedure

### Frontend Rollback

1. **Via Vercel Dashboard:**
   - Go to Deployments
   - Find previous successful deployment
   - Click "Promote to Production"

2. **Via Vercel CLI:**
   ```bash
   vercel rollback
   ```

### Database Rollback

1. Identify migration to rollback to
2. Create reverse migration SQL
3. Run in Supabase SQL Editor
4. Update migration version

## Monitoring

### Application Monitoring
- Check Vercel deployment logs
- Monitor Supabase dashboard
- Review error tracking (Sentry)

### Database Monitoring
- Check Supabase database logs
- Monitor query performance
- Review connection pool usage

## Troubleshooting

### Build Failures
- Check Node.js version (must be 18+)
- Verify all dependencies installed
- Check environment variables

### Deployment Failures
- Verify Vercel project settings
- Check environment variables in Vercel
- Review GitHub Actions logs

### Database Issues
- Verify Supabase connection
- Check RLS policies
- Review migration logs

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Vercel deployment logs
3. Check Supabase logs
4. Contact development team

---

**Last Updated**: $(date)

