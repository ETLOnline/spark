import { processChatNotification } from "./processors/chat"
import { processSubmitCommunityRequestNotification } from "./processors/community"
import { processContactNotification } from "./processors/contact"
import { processProjectInviteNotification } from "./processors/project"
import { processTaskUpdateNotification } from "./processors/task"

interface EventJob {
  sendingTo: string[]
  event: string
  payload: any
}

type EventProcessor = (job: EventJob) => Promise<void>

export const eventsList: Record<string, EventProcessor> = {
  update_task: processTaskUpdateNotification,
  new_connection: processContactNotification,
  accept_connection: processContactNotification,
  project_invite: processProjectInviteNotification,
  chat_invite: processChatNotification,
  community_request: processSubmitCommunityRequestNotification
}
