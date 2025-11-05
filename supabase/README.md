# Supabase Configuration

This directory contains:

## /functions
Supabase Edge Functions for:
- Commission calculations
- Payment processing webhooks
- Notification triggers
- Custom business logic

## /seeds
Sample data for development:
- Test data
- Scan data
- Package data
- Partner data

## Future Migrations
Database schema migrations will be created in later phases using Supabase CLI:
- Partners table
- Patients table
- Tests, Scans, Packages tables
- Bookings table
- Commissions and Payouts tables

## Setup Instructions

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to project:
```bash
supabase link --project-ref aqoyqjgngvtdxgqbdtcw
```

3. Pull existing schema:
```bash
supabase db pull
```

4. Create new migration:
```bash
supabase migration new migration_name
```
