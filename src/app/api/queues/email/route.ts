import { eventsList } from "@/src/services/queue/eventsList"

export async function POST(req: Request) {
  const job = await req.json()
  const handler = eventsList[job.event]

  if (!handler) {
    console.error(`No handler found for event: ${job.event}`)
    return new Response("Handler not found", { status: 400 })
  }

  await handler(job)
  return new Response("OK", { status: 200 })
}
