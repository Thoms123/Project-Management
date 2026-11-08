import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @rtl/shared dikirim sebagai TypeScript, jadi Next yang mengompilasinya.
  transpilePackages: ['@rtl/shared'],
};

export default nextConfig;
