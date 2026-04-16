import { config } from "dotenv"

const env = process.env.NODE_ENV || "development"
config({ path: `.env.${env}` })
config({ path: ".env.local" })
config({ path: ".env" })

import { startWorker } from "./src/services/jobs/worker"
import { startScheduler } from "./src/services/jobs/scheduler"

startWorker()
startScheduler()
