# Lab Link - Diagnostic Booking Platform

A mobile-first, PWA-ready diagnostic booking web application for healthcare partners.

## 🏗️ Project Structure

```
lablink/
├── apps/
│   ├── web/                    # Main partner-facing PWA (Next.js 15)
│   └── admin/                  # Admin dashboard (to be built)
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── config/                 # Shared configuration
│   ├── utils/                  # Helper functions
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript types
├── supabase/
│   ├── functions/              # Supabase Edge Functions
│   └── seeds/                  # Sample data
└── turbo.json                  # Turborepo configuration
```

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI Library**: Tailwind CSS + ShadCN/UI
- **Icons**: Lucide React + Material Icons
- **Animation**: Framer Motion
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod validation
- **PWA**: next-pwa (to be configured)
- **i18n**: next-intl (English & Telugu)

### Backend
- **BaaS**: Supabase (Auth, Database, Storage, Edge Functions)
- **Database**: PostgreSQL
- **Auth**: Email/Password (Admin-authorized signups only)

### Payment Integrations (Future)
- Razorpay
- PhonePe
- Configurable via admin panel

### Monorepo
- **Package Manager**: Yarn (pnpm workspace compatible)
- **Build System**: Turborepo

## 📦 Installation

```bash
# Install dependencies
yarn install

# Install web app dependencies
cd apps/web
yarn install
```

## 🛠️ Development

```bash
# Run all apps in development mode
yarn dev

# Run only web app
cd apps/web
yarn dev
```

Access the app at: `http://localhost:3000`

## 🏗️ Phase 1 - Complete ✅

### Completed Tasks:
- ✅ Turborepo monorepo setup with workspace structure
- ✅ Next.js 15 with App Router and TypeScript
- ✅ All dependencies installed and configured
- ✅ Supabase client setup with provided credentials
- ✅ Base routing structure created:
  - `/` - Home page
  - `/tests` - Tests listing
  - `/tests/[testId]` - Test details
  - `/scans` - Scans listing
  - `/scans/[scanId]` - Scan details
  - `/packages` - Packages listing
  - `/packages/[packageId]` - Package details
  - `/bookings` - Create booking
  - `/my-bookings` - Booking history
  - `/my-profile` - User profile
  - `/my-earnings` - Partner earnings
- ✅ Tailwind CSS + ShadCN/UI components configured
- ✅ Dark mode support
- ✅ PWA manifest.json created
- ✅ Shared packages structure (ui, config, utils, hooks, types)
- ✅ Authentication hooks setup
- ✅ TypeScript types for database schema
- ✅ Supabase folder structure for functions and seeds

## 🔐 Environment Variables

Create `.env.local` in `apps/web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://aqoyqjgngvtdxgqbdtcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_NAME=Lab Link
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📋 Next Phases

### Phase 2 - UI Development
- Build Home Page with hero section
- Category cards and navigation
- Hero banners and promotions

### Phase 3 - Listings & Details
- Test/Scan/Package listing pages
- Search and filter functionality
- Dynamic detail pages with pricing

### Phase 4 - Booking Flow
- Slot selection
- Home collection option
- Patient details form
- Payment integration

### Phase 5 - User Dashboard
- My Bookings page
- Order tracking
- Partner earnings dashboard
- Profile management

### Phase 6 - Admin & Backend Logic
- Admin panel with analytics
- Supabase Edge Functions
- Commission calculations
- Payment webhooks

## 🔑 Key Features (Planned)

- 📱 Mobile-first responsive design
- 🌐 PWA with offline support
- 🔐 Secure authentication (admin-authorized signups)
- 💰 Commission tracking for partners
- 📊 Real-time booking management
- 🏠 Home sample collection
- 💳 Multiple payment options
- 📈 Partner earnings dashboard
- 🌍 Multi-language support (EN/TE)

## 🤝 Partner Types Supported

- Pharmacist
- Nurse
- ASHA Worker
- Technician
- Medical Representative
- Other healthcare professionals

## 📱 PWA Configuration

PWA features ready to implement:
- Install prompt
- Offline caching
- Service worker
- App icons (72x72 to 512x512)
- Splash screens

## 🗄️ Database Schema (Planned)

Tables to be created in Phase 2:
- `partners` - Healthcare partner profiles
- `patients` - Patient information
- `tests` - Lab test catalog
- `scans` - Medical scan catalog
- `packages` - Health package bundles
- `bookings` - Booking records
- `commissions` - Commission tracking
- `payouts` - Payout management

## 🔒 Security

- Row Level Security (RLS) enabled on Supabase
- Admin-only user registration
- Secure payment integration
- Environment variables for sensitive data

## 📄 License

Private - All rights reserved

---

**Status**: Phase 1 Complete - Foundation Setup ✅  
**Next**: Phase 2 - UI Development & Home Page