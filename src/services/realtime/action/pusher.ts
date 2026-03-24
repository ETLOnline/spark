"use server"

import pusherServer from "../pusherServer"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export async function pusherAuthAction(
  socket_id: string,
  channel_name: string
) {
  const user = await AuthUserAction()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Authorize channel
  const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
    user_id: user.unique_id,
    user_info: { name: user.first_name + " " + user.last_name } // optional
  })

  return authResponse
}
