import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
  // PWA configuration will be added here
};

export default nextConfig;
