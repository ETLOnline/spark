import { config } from "dotenv"
import * as schema from "./schema"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const env = process.env.NODE_ENV || "development" //development | test | production

config({ path: `.env.${env}` }) //local is always development
config({ path: ".env.local" })
config({ path: ".env" }) // fallback

const isCloud = env !== "development" //we will connect to non-local db when it is not development

// Retrieve individual environment variables
const DB_HOST = process.env.DB_HOST
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432
const DB_USER = process.env.DB_USER
const DB_PWD = process.env.DB_PWD
const DB_NAME = process.env.DB_NAME

console.log("DB_HOST", DB_HOST)

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
  max: isCloud ? 10 : 5, // Max concurrent connections in the pool
  idle_timeout: 30, // How long an idle connection stays open (seconds)
  connect_timeout: 30, // How long to wait for a connection to establish (seconds)
  ssl: isCloud
    ? {
        require: true,
        rejectUnauthorized: false
      }
    : false,
  ...(isCloud && {
    connection: {
      application_name: "spark-app"
    }
  })
})

export const db = drizzle(queryClient, { schema: schema })
