/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*"
      }
    ]
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    ABLY_API_KEY: process.env.ABLY_API_KEY,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_REGION: process.env.S3_REGION,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    AZURE_STORAGE_ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_ACCOUNT_KEY: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    AZURE_CONTAINER_NAME: process.env.AZURE_CONTAINER_NAME
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb"
    },
    // --- ADD THESE LINES ---
    // Tells Next.js to keep native Node.js modules external (not bundle them)
    // This is critical for modules like @libsql/client that use native binaries.
    // If you have other native modules (e.g., 'sharp' for image processing), add them here too.
    serverComponentsExternalPackages: [
      "@libsql/client",
      "libsql" // Include 'libsql' as well if it's a direct dependency or part of the internal structure
      // Add any other packages that load native C++ binaries
    ]
  },
  // --- ADD THIS LINE ---
  // Specifies to build the application as a standalone Node.js server.
  // This creates a ./.next/standalone folder with all necessary files,
  // including a pruned node_modules, ready for deployment.
  output: "standalone"
}

export default nextConfig
