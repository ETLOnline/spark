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
    ABLY_API_KEY: process.env.ABLY_API_KEY,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_REGION: process.env.S3_REGION,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb"
    }
  }
}

export default nextConfig
