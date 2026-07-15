/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
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
    ],
  },
};

export default nextConfig;
