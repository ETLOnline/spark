"use client"

import Pusher from "pusher-js"
import { pusherAuthAction } from "./action/pusher"

const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authorizer: (channel, options) => {
    return {
      authorize: async (socketId, callback) => {
        try {
          const authResponse = await pusherAuthAction(socketId, channel.name)
          callback(null, authResponse)
        } catch (err) {
          callback(err as Error, null)
        }
      }
    }
  }
})

export default pusherClient
