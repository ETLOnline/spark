import { config } from "dotenv"
import * as schema from "./schema"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { readFileSync } from "fs"

const environmentType = process.env.NODE_ENV || "development" //development | test | production

config({ path: `.env.${environmentType}` }) //local is always development
config({ path: ".env.local" })
config({ path: ".env" }) // fallback


// Retrieve individual environment variables
const DB_HOST = process.env.DB_HOST
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432
const DB_USER = process.env.DB_USER
const DB_PWD = process.env.DB_PWD
const DB_NAME = process.env.DB_NAME
const DB_SSL = process.env.DB_SSL && process.env.DB_SSL === 'true' ? true : false

// Basic validation for critical parameters
if (!DB_HOST || !DB_USER || !DB_PWD || !DB_NAME) {
  throw new Error("Missing one or more critical DB environment variables.")
}

const queryClient = postgres({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PWD,
  database: DB_NAME,
  max: 10, // Max concurrent connections in the pool
  idle_timeout: 30, // How long an idle connection stays open (seconds)
  connect_timeout: 40, // How long to wait for a connection to establish (seconds)
  ssl: DB_SSL ? {
    require: true,
    rejectUnauthorized: false
  }: false,
  ...(environmentType === "production" && {
    connection: {
      application_name: "spark-app"
    }
  })
})

export const db = drizzle(queryClient, { schema: schema })
