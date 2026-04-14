/**
 * Custom Next.js server
 *
 * Boots the DB-backed job worker and scheduler alongside the Next.js request
 * handler. Use this instead of `next dev` / `next start`:
 *
 *   dev:   tsx watch server.ts
 *   prod:  tsx server.ts
 *
 * Note: --turbopack is not available in custom-server mode. Hot-reloading
 * in development is provided by Next.js internals (HMR still works for
 * client/server components; only the server.ts file itself requires a restart).
 */

import { config } from "dotenv"

// Load env vars before any module that reads process.env (e.g. src/db/index.ts)
const env = process.env.NODE_ENV || "development"
config({ path: `.env.${env}` })
config({ path: ".env.local" })
config({ path: ".env" })

import { createServer } from "http"
import next from "next"
import { startWorker } from "./src/services/jobs/worker"
import { startScheduler } from "./src/services/jobs/scheduler"

const dev = process.env.NODE_ENV !== "production"
const port = parseInt(process.env.PORT ?? "3000", 10)

const app = next({ dev })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  startWorker()
  startScheduler()

  createServer(handler).listen(port, () => {
    console.log(`> Ready on http://localhost:${port} [${dev ? "dev" : "prod"}]`)
  })
})
