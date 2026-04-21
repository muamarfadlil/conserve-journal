/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mengizinkan gambar dari domain eksternal (Unsplash sebagai placeholder)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
