/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('sharp');
    }
    return config;
  },
  // Add any other necessary configurations
}

export default nextConfig;