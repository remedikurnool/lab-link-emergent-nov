import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { OfflineBanner } from '@/components/ui/offline-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lab Link - Diagnostic Booking Platform',
  description: 'Book lab tests, scans, and health packages for your patients',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lab Link',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleAnalytics />
        <OfflineBanner />
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
