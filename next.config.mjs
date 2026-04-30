import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sharp', 'archiver'],
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: '/en', destination: '/', permanent: false },
      { source: '/en/:path*', destination: '/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
