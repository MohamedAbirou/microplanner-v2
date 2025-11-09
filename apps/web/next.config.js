/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@microplanner/types', '@microplanner/config'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

module.exports = nextConfig;
