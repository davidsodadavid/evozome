import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained production build (server.js + traced node_modules) for VPS deploys
  output: "standalone",
  outputFileTracingIncludes: {
    "/**": [
      // bcryptjs ships a dual ESM/CJS package.json that Next's file tracer
      // fails to follow, silently dropping it from the standalone build and
      // breaking the login server action at runtime. Force it in explicitly.
      "./node_modules/bcryptjs/**",
      // sharp resolves its native binary via a runtime require() computed
      // from process.platform/arch, which the tracer's static analysis can't
      // follow — same class of bug as bcryptjs above. Without this, every
      // deploy ships a sharp with no binary at all, and uploading a photo in
      // the admin panel crashes with ERR_DLOPEN_FAILED. Both the top-level
      // symlinked path and the underlying pnpm store path are listed since
      // it's one extra symlink hop deeper than bcryptjs (sharp -> its own
      // nested @img optional deps). Production is Debian (glibc) linux-x64.
      "./node_modules/sharp/**",
      "./node_modules/@img/sharp-linux-x64/**",
      "./node_modules/@img/sharp-libvips-linux-x64/**",
      "./node_modules/.pnpm/@img+sharp-linux-x64@*/**",
      "./node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/**",
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
