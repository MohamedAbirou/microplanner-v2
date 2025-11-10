/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@microplanner/ui', '@microplanner/utils', '@microplanner/types'],
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com'],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };
    return config;
  },
};

module.exports = nextConfig;
