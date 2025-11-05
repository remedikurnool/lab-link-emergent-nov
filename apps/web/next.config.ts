import type { NextConfig } from 'next';

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
  // PWA configuration will be added here
};

export default nextConfig;
