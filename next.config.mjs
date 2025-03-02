import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})({
  // Next.js configuration
  reactStrictMode: true,
  
  // Explicitly configure the build system
  experimental: {
    // Use Turbopack in development for faster refresh
    turbo: {
      loaders: {
        // Add any custom loaders if needed
      },
    },
  },
  
  // Webpack configuration if needed
  webpack: (config, { isServer }) => {
    // Keep the existing webpack configuration
    return config;
  },
});

export default nextConfig;
