import { POST } from "@/src/app/api/queues/email/route"

export async function AddToQueue(job: {
  sendingTo: string[]
  event: string
  payload: any
  withData?: boolean
}) {
  await POST.enqueue(job, { delay: "1m" })
}
