import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wajib untuk Docker standalone build yang efisien (~200MB vs ~1GB)
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
