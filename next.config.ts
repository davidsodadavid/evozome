import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained production build (server.js + traced node_modules) for VPS deploys
  output: "standalone",
  // sharp has a native addon plus a pile of nested-only (non-hoisted) plain
  // JS deps (detect-libc, semver, @img/colour) that outputFileTracingIncludes
  // globs below couldn't reliably catch — every deploy shipped a sharp
  // missing one piece or another, breaking photo uploads in the admin
  // panel. This tells Next to require() sharp via plain Node resolution
  // instead of bundling/tracing it, which makes the standalone build copy
  // its whole real node_modules folder (and its deps) verbatim.
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/**": [
      // bcryptjs ships a dual ESM/CJS package.json that Next's file tracer
      // fails to follow, silently dropping it from the standalone build and
      // breaking the login server action at runtime. Force it in explicitly.
      "./node_modules/bcryptjs/**",
    ],
  },
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
