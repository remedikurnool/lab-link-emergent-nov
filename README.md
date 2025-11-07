# Lab Link - Diagnostic Booking Platform

A complete, production-ready diagnostic booking platform for healthcare partners.

## 🚀 Quick Start

```bash
# Start both apps
./start-platform.sh

# Or manually:
# Partner App (Port 3000)
cd apps/web && PORT=3000 yarn dev

# Admin Panel (Port 3001)
cd apps/admin && PORT=3001 yarn dev
```

**Access:**
- 📱 Partner App: http://localhost:3000
- 👨‍💼 Admin Panel: http://localhost:3001

## ✨ Complete Feature Set

### 🏥 Partner App (Port 3000)
✅ **Authentication:** Email/password via Supabase Auth  
✅ **Browse & Search:** Real-time search with filters  
✅ **Multi-Centre Pricing:** Compare prices across centres  
✅ **Shopping Cart:** Full cart management  
✅ **Booking Flow:** 3-step checkout with validation  
✅ **Prescription Upload:** Supabase Storage integration  
✅ **My Bookings:** Booking history & tracking  
✅ **My Earnings:** Commission tracking (10%)  
✅ **Profile Management:** Edit details, bank info  
✅ **PWA Ready:** Installable, offline support  
✅ **Multi-Language:** English & Telugu  
✅ **Real-Time Notifications:** Browser push  

### 👨‍💼 Admin Panel (Port 3001)
✅ **Dashboard:** Revenue, partners, bookings stats  
✅ **Partners Management:** Activate/deactivate, view all  
✅ **Bookings Management:** Approve, complete, cancel  
✅ **Commissions:** Approve & mark as paid  
✅ **Centres Management:** Add/edit diagnostic centres  
✅ **Settings:** Configure WhatsApp, Razorpay, PhonePe  
✅ **Real-Time Updates:** Instant sync with partner app  

## 🗄️ Supabase Backend

### Database (9 Tables):
- `diagnostic_centres` - Lab/scan centres
- `tests` - Lab tests catalogue  
- `scans` - Medical scans
- `packages` - Health packages
- `centre_pricing` - Multi-centre pricing
- `partners` - Healthcare partners
- `patients` - Patient records
- `bookings` - All bookings
- `commissions` - Partner earnings

### Features:
- ✅ Row Level Security (RLS)
- ✅ Real-time subscriptions
- ✅ File storage (prescriptions, reports)
- ✅ Edge functions
- ✅ Authentication

## 🔧 Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + ShadCN/UI
- Zustand (state management)
- TanStack Query (data fetching)

**Backend:**
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Edge Functions

**PWA:**
- next-pwa (@ducanh2912/next-pwa)
- Service worker
- Offline caching
- Install prompt

**i18n:**
- next-intl
- English & Telugu support

**Integrations:**
- Razorpay (admin-configurable)
- PhonePe (admin-configurable)
- WhatsApp Business API (admin-configurable)

## 📁 Project Structure

```
lablink/
├── apps/
│   ├── web/          # Partner App (Port 3000)
│   └── admin/        # Admin Panel (Port 3001)
├── packages/         # Shared packages
├── supabase/         # Database migrations & functions
└── supervisor/       # Process management
```

## 🔐 Setup Supabase

1. **Run Migrations:**
   - Copy `/app/supabase/migrations/001_initial_schema.sql`
   - Paste in Supabase SQL Editor → Run
   - Copy `/app/supabase/migrations/002_seed_data.sql`
   - Paste and Run
   - Copy `/app/supabase/migrations/003_storage_and_settings.sql`
   - Paste and Run

2. **Create Storage Buckets:**
   - Go to Storage → New Bucket
   - Create: `prescriptions` (private, 5MB)
   - Create: `reports` (private, 10MB)

3. **Enable Realtime:**
   - Database → Replication
   - Enable for: `bookings`, `commissions`

4. **Create Partner Account:**
   - Auth → Users → Add User
   - Email: partner@lablink.com, Password: demo123
   - Link to partners table (see QUICK_SUPABASE_SETUP.md)

## 💡 Key Features

### File Upload
- Prescription upload during checkout
- Report upload in admin panel
- Supabase Storage integration
- Preview & download

### Payment Gateways (Admin Configurable)
- **Razorpay:** Full integration ready
- **PhonePe:** Integration ready
- Configure in Admin → Settings
- Enable/disable from admin

### Notifications
- **Browser Push:** Real-time commission updates
- **WhatsApp:** Admin-configurable
- **SMS:** Integration ready

### PWA
- **Installable:** Add to home screen
- **Offline:** Works without internet
- **Service Worker:** Automatic caching
- **Install Prompt:** Auto-appears after 10s

### Multi-Language
- **English** (default)
- **Telugu** (తెలుగు)
- Language switcher in top bar
- All major text translated

## 📊 Sample Data

After running migrations:
- 3 Diagnostic Centres (Vijaya, Thyrocare, Lucid)
- 6 Lab Tests (CBC, HbA1c, Thyroid, FBS, Lipid, Vitamin D)
- 6 Scans (USG, CT, ECHO, ECG, MRI, X-Ray)
- 3 Packages (Diabetes, Full Body, Master)
- 24 Centre pricing entries

## 🚀 Deployment

### Vercel (Frontend)
```bash
# Partner App
vercel --cwd apps/web

# Admin Panel  
vercel --cwd apps/admin
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_APP_URL=your_domain
```

## 📖 Documentation

- `QUICK_SUPABASE_SETUP.md` - 5-minute setup
- `SUPABASE_INTEGRATION.md` - Complete integration guide
- `DEVELOPMENT.md` - Development workflow
- `supabase/SETUP_INSTRUCTIONS.md` - Detailed setup

## ✅ Features Checklist

**Partner App:**
- [x] Authentication (Supabase Auth)
- [x] Browse tests/scans/packages
- [x] Real-time search & filters
- [x] Multi-centre pricing
- [x] Shopping cart
- [x] 3-step checkout
- [x] Prescription upload
- [x] Booking management
- [x] Commission tracking
- [x] Profile management
- [x] PWA support
- [x] Multi-language (EN/TE)
- [x] Real-time notifications

**Admin Panel:**
- [x] Analytics dashboard
- [x] Partners management
- [x] Bookings management
- [x] Commission approvals
- [x] Centres management
- [x] Integration settings
- [x] WhatsApp config
- [x] Razorpay config
- [x] PhonePe config

**Backend:**
- [x] Supabase database (9 tables)
- [x] Row Level Security
- [x] Real-time subscriptions
- [x] File storage
- [x] Edge functions ready
- [x] Auto commission calculation

## 🎯 Production Ready

This is a complete, production-ready MVP with:
- 14 partner pages
- 6 admin pages
- Full Supabase backend
- Real-time features
- PWA capabilities
- Multi-language support
- Payment integrations ready
- File upload/download
- Commission tracking
- Secure RLS policies

## 📞 Support

For issues or questions, check the documentation files or create an issue.

## 📄 License

Private - All rights reserved

---

**Built with ❤️ using Next.js 15, Supabase, and TypeScript**

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