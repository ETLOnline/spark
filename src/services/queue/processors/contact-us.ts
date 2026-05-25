import { sendEmailFromTemplate } from "@/src/utils/serverHelpers"

export async function processContactUsSubmittedNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  await sendEmailFromTemplate({
    templateName: job.event,
    payload: job.payload,
    sendingTo: job.sendingTo
  })
}

export async function processNewContactUsAdminNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  await sendEmailFromTemplate({
    templateName: job.event,
    payload: job.payload,
    sendingTo: job.sendingTo
  })
}
