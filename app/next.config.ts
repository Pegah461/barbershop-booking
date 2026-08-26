import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Gallery images are stored as URLs on `GalleryImage.url`. Local files in
    // /public need no entry here; Cloudinary-hosted ones do — scoped to this
    // shop's own cloud name, not any Cloudinary account.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dxxo7civn/**",
      },
    ],
  },
};

export default nextConfig;
