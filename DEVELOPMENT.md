# Lab Link - Development Guide

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Supabase account with project created

### Initial Setup

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables in `apps/web/.env.local`

4. Run development server:
```bash
yarn dev
```

## Development Workflow

### Adding New Routes
Routes are automatically created in `apps/web/src/app/` using Next.js App Router conventions.

### Creating Components
1. Add to `apps/web/src/components/` for app-specific components
2. Add to `packages/ui/` for shared components across apps

### Working with Supabase

#### Client-side usage:
```typescript
import { supabase } from '@/lib/supabase/client';
```

#### Server-side usage:
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';
```

### State Management

- **Server State**: Use TanStack Query for API data
- **Client State**: Use Zustand for global UI state
- **Form State**: Use React Hook Form

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use ShadCN/UI components as base

## Project Scripts

```bash
# Development
yarn dev              # Run all apps in dev mode
yarn build            # Build all apps
yarn lint             # Lint all packages

# Web app specific
cd apps/web
yarn dev              # Run Next.js dev server
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Run ESLint
```

## Best Practices

1. **Mobile First**: Design for mobile screens first
2. **TypeScript**: Use proper typing for all functions and components
3. **Error Handling**: Always handle errors gracefully
4. **Loading States**: Show loading indicators for async operations
5. **Accessibility**: Use semantic HTML and ARIA labels
6. **Performance**: Optimize images and lazy load components

## Testing

Testing will be set up in future phases using:
- Jest for unit tests
- Playwright for E2E tests

## Deployment

### Vercel (Recommended for Next.js)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Supabase
Backend is already deployed and configured.
