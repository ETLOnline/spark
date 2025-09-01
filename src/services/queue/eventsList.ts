import { processTaskUpdateNotification } from "./processors/task"

interface EventJob {
  sendingTo: string[]
  event: string
  payload: any
}

type EventProcessor = (job: EventJob) => Promise<void>

export const eventsList: Record<string, EventProcessor> = {
  update_task: processTaskUpdateNotification
}
