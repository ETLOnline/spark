import { sendEmailFromTemplate } from "@/src/utils/serverHelpers"

export async function processIdentityVerificationOtpNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  console.log(
    "Processing identity verification OTP notification for:",
    job.sendingTo,
    "with payload:",
    job.payload
  )
  await sendEmailFromTemplate({
    templateName: job.event,
    payload: job.payload,
    sendingTo: job.sendingTo
  })
}

export async function processIdentityVerifiedNotification(job: {
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
