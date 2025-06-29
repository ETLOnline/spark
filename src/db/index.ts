import { config } from "dotenv"
import * as schema from "./schema"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { readFileSync } from "fs"

config({ path: ".env.local" })

const queryClient = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.DATABASE_SSL === "true" && {
    rejectUnauthorized: false,
    ca: process.env.DATABASE_CA

  }
})
export const db = drizzle(queryClient, { schema: schema })
