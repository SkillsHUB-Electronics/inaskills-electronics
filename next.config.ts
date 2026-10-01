import type { NextConfig } from "next";

// GitHub Pages melayani situs di /<nama-repo>, jadi basePath diisi lewat env saat build.
// Kosongkan NEXT_PUBLIC_BASE_PATH saat pindah ke Vercel atau domain sendiri.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
