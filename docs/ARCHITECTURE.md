# Lab Link - Architecture Documentation

## Overview

Lab Link is a monorepo-based diagnostic booking platform built with Next.js 15, TypeScript, and Supabase.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Web App    │         │  Admin App   │            │
│  │  (Next.js)   │         │  (Next.js)   │            │
│  └──────────────┘         └──────────────┘            │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │  Edge Funcs  │  │   Storage    │ │
│  │   Database    │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │    Auth      │  │   Realtime   │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Razorpay │  │ PhonePe  │  │ Twilio   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ MSG91    │  │ Resend   │  │ SendGrid │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN/UI, Radix UI
- **State Management**: Zustand, TanStack Query
- **Forms**: React Hook Form, Zod
- **PWA**: next-pwa

### Backend
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)
- **Realtime**: Supabase Realtime

### Infrastructure
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (planned)
- **Analytics**: Google Analytics (planned)

## Project Structure

```
lab-link-emergent-nov/
├── apps/
│   ├── web/                 # Main web application
│   │   ├── src/
│   │   │   ├── app/         # Next.js app router pages
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and services
│   │   │   └── store/       # Zustand stores
│   │   └── public/          # Static assets
│   └── admin/               # Admin dashboard
│       └── src/
│           ├── app/
│           ├── components/
│           └── lib/
├── supabase/
│   ├── functions/           # Edge Functions
│   └── migrations/          # Database migrations
├── e2e/                     # E2E tests
├── docs/                    # Documentation
└── package.json             # Root package.json
```

## Data Flow

### Booking Flow

1. User browses tests/scans/packages
2. Adds items to cart (Zustand store)
3. Proceeds to checkout
4. Fills patient details
5. Selects collection details
6. Chooses payment method
7. Creates booking (Supabase)
8. Processes payment (Edge Function)
9. Sends notifications (Edge Functions)
10. Updates booking status

### Payment Flow

1. User selects payment method
2. Frontend calls Edge Function to create order
3. Payment gateway redirects user
4. User completes payment
5. Gateway sends webhook to Edge Function
6. Edge Function verifies payment
7. Updates booking payment status
8. Sends confirmation notifications

## Security

### Authentication
- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) policies
- Session management

### Data Protection
- Encrypted connections (HTTPS)
- Secure credential storage
- Input validation and sanitization
- CSRF protection

### Authorization
- Role-based access control
- Partner-specific data isolation
- Admin-only operations

## Scalability

### Database
- Indexed queries
- Connection pooling
- Query optimization
- Caching strategy

### Frontend
- Code splitting
- Image optimization
- Lazy loading
- CDN for static assets

### Backend
- Edge Functions for serverless compute
- Horizontal scaling via Supabase
- Rate limiting

## Monitoring & Observability

### Error Tracking
- Error boundaries
- Centralized error handling
- Sentry integration (planned)

### Performance
- Lighthouse CI
- Core Web Vitals tracking
- Database query monitoring

### Logging
- Structured logging
- Request tracing
- Audit logs

## Deployment

### Environments
- **Development**: Local development
- **Staging**: Pre-production testing
- **Production**: Live environment

### CI/CD Pipeline
1. Code push triggers GitHub Actions
2. Run tests
3. Build applications
4. Deploy to Vercel
5. Run database migrations
6. Health checks

## Future Enhancements

- Microservices architecture (if needed)
- Redis caching layer
- Message queue for async tasks
- GraphQL API (optional)
- Multi-region deployment

---

**Last Updated**: $(date)

