import { getQueueClient } from "./clientQueue"

export async function AddToQueue(job: {
  sendingTo: string[]
  event: string
  payload: any
  withData?: boolean
}) {
  try {
    const queueClient = getQueueClient()
    const baseUrl = process.env.WEBHOOK_PUBLIC_BASE_URL
    const messageData = {
      webhookUrl: `${baseUrl}/api/queues/email`,
      sendingTo: job.sendingTo,
      event: job.event,
      payload: job.payload,
      withData: job.withData || false
    }

    const jsonString = JSON.stringify(messageData)
    const base64Message = Buffer.from(jsonString, "utf-8").toString("base64")
    // we can use visibilityTimeout to delay processing of the message
    // const visibilityTimeout = 30; // Delay processing by 30 seconds
    const newMessage = await queueClient.sendMessage(base64Message, {
      messageTimeToLive: -1
    })

    return newMessage
  } catch (error) {
    console.error("Failed to add message to queue:", error)
    throw error
  }
}
