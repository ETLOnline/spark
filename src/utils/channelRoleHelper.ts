import { SelectUser } from "../db/schema"
import { isUserAdmin } from "./helpers"

export const getChannelRole = (channelId: string, user: SelectUser) => {
  const channelUser = user.channels?.find((cu) => cu.channel_id === channelId)
  if (channelUser) {
    return channelUser.role
  }
  return null
}

export const isUserChannelAdmin = (channelId: string, user: SelectUser) => {
  const channelRole = getChannelRole(channelId, user)
  if (channelRole === "admin") {
    return true
  }

  return false
}

export const canControlChannel = (channelId: string, user: SelectUser) => {
  const isChannelAdmin = isUserChannelAdmin(channelId, user)
  const isPlatformAdmin = isUserAdmin(user)
  if (isChannelAdmin || isPlatformAdmin) {
    return true
  }
  return false
}
