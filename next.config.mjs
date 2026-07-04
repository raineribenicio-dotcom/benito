/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Optimización automática vía remote loaders (Cloudinary/S3 + Next Image)
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Server Actions habilitadas por defecto en Next 14; límite de payload para uploads
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    // Cabeceras de seguridad base (CSP completa se define por middleware/edge)
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
