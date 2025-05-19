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
    S3_ENDPOINT: process.env.S3_ENDPOINT
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb"
    }
  }
}

export default nextConfig
