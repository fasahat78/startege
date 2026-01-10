/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors. Only use this if you know what you're doing.
    ignoreBuildErrors: true,
  },
  images: {
    domains: [],
  },
  // CORS configuration
  async headers() {
    return [
      {
        // Apply CORS to all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            // Note: This is a static value for Next.js headers()
            // Dynamic origin matching is handled in individual route handlers
            value: process.env.NODE_ENV === "production" 
              ? process.env.NEXT_PUBLIC_APP_URL || "https://startege.com"
              : "*", // Allow all origins in development
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

