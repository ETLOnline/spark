import pusherServer from "./realtime/pusherServer"


export async function triggerPusherEvent(
  user_id: string,
  event: string,
  data: any
) {
  try {
    const channel = `user-${user_id}`
    await pusherServer.trigger(channel, event, data)
  } catch (e: any) {
    throw new Error(`Pusher trigger failed: ${e.message}`)
  }
}