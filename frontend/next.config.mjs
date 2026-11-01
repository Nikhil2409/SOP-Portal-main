/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  images: {
    // next/image optimisation needs a server; static export serves images as-is.
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  ...(isDev
    ? {
        // `npm run dev`: forward API calls to the Express backend.
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: "http://localhost:5000/api/:path*",
            },
          ];
        },
      }
    : {
        // `npm run build`: plain HTML/JS in `out/`, served by Express from the
        // same origin as the API. No Next.js server is needed in production.
        output: "export",
      }),
};

export default nextConfig;
