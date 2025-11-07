import type { NextConfig } from 'next';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/icons-material'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aqoyqjgngvtdxgqbdtcw.supabase.co',
      },
    ],
  },
  outputFileTracingRoot: '/app',
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  swcMinify: true,
  fallbacks: {
    document: '/offline',
  },
})(nextConfig);
