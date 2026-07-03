/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Next 16 enables Turbopack's dev filesystem cache by DEFAULT (beta).
    // On slow / external / network drives (your project is on G:), this disk
    // cache writes corrupted SSR chunks → ChunkLoadError: "Invalid or
    // unexpected token" in .next/dev/server/chunks. Turning it off keeps
    // Turbopack's speed without the corrupt-cache failures.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
