import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  // Allow local network access (phone on same WiFi)
  allowedDevOrigins: ['192.168.43.162'],
};

export default nextConfig;
