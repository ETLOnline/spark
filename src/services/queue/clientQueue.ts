import { QueueClient } from "@azure/storage-queue"

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const queueName = process.env.AZURE_NOTIFICATION_QUEUE_NAME

if (!connectionString) {
  throw new Error(
    "AZURE_STORAGE_CONNECTION_STRING is not set in environment variables."
  )
}

if (!queueName) {
  throw new Error(
    "AZURE_NOTIFICATION_QUEUE_NAME is not set in environment variables."
  )
}

let queueClient: QueueClient

export function getQueueClient(): QueueClient {
  if (!queueClient) {
    queueClient = new QueueClient(connectionString!, queueName!)
    console.log(`Azure Queue client for '${queueName}' has been initialized.`)
  }
  return queueClient
}
