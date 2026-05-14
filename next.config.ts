import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pure static export — every route in this portfolio is prerendered, no
  // server runtime needed. Produces an `out/` directory with HTML/CSS/JS,
  // hostable on any static CDN (Cloudflare Pages, GitHub Pages, S3, etc).
  // Avoids the OpenNext / Workers SSR path that was failing on deploy.
  output: "export",
};

export default nextConfig;
