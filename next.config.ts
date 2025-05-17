/** @type {import('next').NextConfig} */
const nextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ This skips type checking during build
  },
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bsoafggfuigctdkzssrc.supabase.co",
      },
    ],
  },

  // async headers() {
  //   return [
  //     {
  //       source: "/embed",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: "frame-src 'self' https://roadsidecoder.created.app;",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;