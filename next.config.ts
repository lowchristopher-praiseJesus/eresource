import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 300, // restore ~v14 default; prevents router from refetching dynamic pages too aggressively
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
    ],
  },
}

export default nextConfig
