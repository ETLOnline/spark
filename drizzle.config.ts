import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"
import { readFileSync } from "fs"

config({ path: ".env.local" })

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_SSL === "true" && {
      rejectUnauthorized: false,
      ca: readFileSync("./src/cert/certificate.pem").toString()
    }
  }
})
