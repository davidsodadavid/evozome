import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained production build (server.js + traced node_modules) for VPS deploys
  output: "standalone",
  // sharp's native addon dlopen()s libvips-cpp.so at the OS/ELF level —
  // invisible to any JS-based tracer, since there's no require()/import to
  // follow. serverExternalPackages gets sharp's own plain-JS deps (detect-
  // libc, semver, @img/colour) copied correctly by having Next require() it
  // via normal Node resolution instead of bundling it, but the libvips .so
  // itself still needs forcing in below — without it every deploy ships a
  // sharp that dlopen-fails (ERR_DLOPEN_FAILED), breaking photo uploads in
  // the admin panel. Confirmed by iterating against the actual CI build;
  // neither half alone was enough, this box is Debian (glibc) linux-x64.
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/**": [
      // bcryptjs ships a dual ESM/CJS package.json that Next's file tracer
      // fails to follow, silently dropping it from the standalone build and
      // breaking the login server action at runtime. Force it in explicitly.
      "./node_modules/bcryptjs/**",
      // The untraceable half of the sharp fix above — see comment there.
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
