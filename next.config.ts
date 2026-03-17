import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  headers: async () => [
    {
      // Empêcher le cache CDN sur toutes les pages dynamiques
      source: '/((?!_next/static|_next/image|favicon).*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        { key: 'CDN-Cache-Control', value: 'no-store' },
        { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
      ],
    },
  ],
  images: {
    minimumCacheTTL: 60,
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'faith-shop.fr',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
  },
};

export default nextConfig;
