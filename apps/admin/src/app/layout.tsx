import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Note: Environment variables are handled gracefully in @/lib/supabase.ts
// The app will work with placeholder values and use mock data if Supabase is not configured

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lab Link Admin - Management Portal',
  description: 'Admin panel for Lab Link diagnostic booking platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
