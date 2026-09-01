/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the production domain to connect to the Next.js
  // development server and its HMR/WebSocket resources.
  allowedDevOrigins: [
    "sbsgroups.co.in",
    "www.sbsgroups.co.in",
  ],

  reactCompiler: true,

  experimental: {
    turbopackFileSystemCacheForDev: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sbsgroups.co.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.sbsgroups.co.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
