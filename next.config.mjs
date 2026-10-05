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
    AZURE_CONTAINER_NAME: process.env.AZURE_CONTAINER_NAME,
    NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID:
      process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID,
    NEXT_PUBLIC_PUSHER_BEAMS_SECRET_KEY:
      process.env.NEXT_PUBLIC_PUSHER_BEAMS_SECRET_KEY,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID,
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
    PUSHER_SECRET: process.env.PUSHER_SECRET,
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    AZURE_STORAGE_CONNECTION_STRING:
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    AZURE_NOTIFICATION_QUEUE_NAME: process.env.AZURE_NOTIFICATION_QUEUE_NAME
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb"
    },
    middlewareClientMaxBodySize: "50mb"
  },
  // --- UPDATED: 'experimental.serverComponentsExternalPackages' moved to 'serverExternalPackages' ---
  serverExternalPackages: [
    "@libsql/client", // Ensure @libsql/client is externalized
    "libsql" // Also include the raw 'libsql' package if used directly
    // Add any other packages that load native C++ binaries
  ],
  // --- ADD THIS LINE ---
  // Specifies to build the application as a standalone Node.js server.
  // This creates a ./.next/standalone folder with all necessary files,
  // including a pruned node_modules, ready for deployment.
  output: "standalone"
}

export default nextConfig
