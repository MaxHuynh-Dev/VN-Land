import { DEV_ENV, PROD_ENV } from '@Constants/envs';
import withPWA from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const isProd = process.env.NEXT_PUBLIC_APP_ENV === PROD_ENV;
const baseConfig: NextConfig = {
  // Next 16 khóa mỗi thư mục output cho một `next dev`; e2e (cổng 3100) dùng thư mục riêng để
  // chạy song song với dev server của người dùng.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1337'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  }
};

const createNextConfig = (): NextConfig => {
  if (isProd) {
    return withPWA({
      dest: 'public',
      disable: process.env.NEXT_PUBLIC_APP_ENV === DEV_ENV,
      register: true,
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true,
        disableDevLogs: true
      }
    })(baseConfig);
  }
  return baseConfig;
};

export default createNextConfig();
