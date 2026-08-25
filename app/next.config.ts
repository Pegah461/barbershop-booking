import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Gallery images are stored as URLs on `GalleryImage.url`. Local files in
    // /public need no entry here; Cloudinary-hosted ones do. Narrow this to
    // your own cloud name (…/<cloud-name>/**) once the account exists.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
