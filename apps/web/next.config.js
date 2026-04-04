/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@aesthetic-track/domain',
    '@aesthetic-track/application',
    '@aesthetic-track/infrastructure',
    '@aesthetic-track/shared',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
};

module.exports = nextConfig;
