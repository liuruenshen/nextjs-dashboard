import { NextConfig } from 'next';

const { REMOTE_PATTERN } = require('./app/next.config.shared');

const nextConfig: NextConfig = {
  experimental: {},
  images: {
    remotePatterns: REMOTE_PATTERN,
  },
  async headers() {
    return [
      {
        source: '/((?!_next).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
