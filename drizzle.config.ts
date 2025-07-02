import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

const DB_HOST = process.env.DB_HOST
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432
const DB_USER = process.env.DB_USER
const DB_PWD = process.env.DB_PWD
const DB_NAME = process.env.DB_NAME

console.log("DB_HOST", DB_HOST)

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: DB_HOST!,
    port: DB_PORT!,
    user: DB_USER!,
    password: DB_PWD!,
    database: DB_NAME!
  }
})
