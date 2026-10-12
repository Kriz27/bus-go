/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/bus-go',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.58'],
};

export default nextConfig;
