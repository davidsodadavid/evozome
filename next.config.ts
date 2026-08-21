import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained production build (server.js + traced node_modules) for VPS deploys
  output: "standalone",
  turbopack: {
    // A stray lockfile in a parent directory makes Next mis-detect the workspace root
    root: path.join(__dirname),
  },
  experimental: {
    // A bit above the photo/video upload limits in src/lib/uploads.ts, so
    // oversized uploads hit our friendly error message instead of Next's
    // raw "Body exceeded" crash page.
    serverActions: {
      bodySizeLimit: "220mb",
    },
  },
};

export default nextConfig;
