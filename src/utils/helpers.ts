import { pageMeta } from "@/src/utils/constants"
import { ProfileActivity } from "../components/Dashboard/Connections/types/connections.types"
import {
  InsertNotification,
  SelectChannel,
  SelectSpace,
  SelectUser
} from "../db/schema"
import { AblyClient } from "../services/realtime/AblyClient"

export const joinRequestChannel = (
  channelId: string,
  onRequestReceived: (request: ProfileActivity, activity: string) => void,
  channelEvents: string[]
) => {
  const channel = AblyClient.channels.get(channelId)
  // Subscribe to incoming requests
  channel.subscribe(channelEvents, (message) => {
    onRequestReceived(message.data, message.name as string)
  })
  // Return functions to send messages and cleanup
  return {
    unsubscribe: () => {
      channel.unsubscribe(channelEvents)
    }
  }
}

export const killConnection = (
  acvtivitySetter: React.Dispatch<React.SetStateAction<ProfileActivity[]>>,
  action: "reject" | "disconnect",
  user_id: string,
  contact_id: string
) => {
  acvtivitySetter((profileActivities: ProfileActivity[]) =>
    profileActivities.map((activity) => {
      if (activity.user_id === user_id && activity.contact_id === contact_id) {
        return action === "disconnect"
          ? {
              ...activity,
              is_accepted: 0
            }
          : { ...activity, is_requested: 0 }
      }
      return activity
    })
  )
}

export const joinNotificationChannel = (
  channelId: string,
  onRequestReceived: (
    notifcation: InsertNotification,
    activity: string
  ) => void,
  channelEvents: string[]
) => {
  const channel = AblyClient.channels.get(channelId)
  // Subscribe to incoming notifications
  channel.subscribe(channelEvents, (message) => {
    onRequestReceived(message.data, message.name as string)
  })
  // Return functions to send messages and cleanup
  return {
    unsubscribe: () => {
      channel.unsubscribe()
    }
  }
}

export const joinChannelsAndSpacesChannel = (
  channelId: string,
  onUpdate: (
    data: SelectChannel | SelectSpace,
    activity: string
  ) => void | Promise<void>,
  channelEvents: string[]
) => {
  const channel = AblyClient.channels.get(channelId)
  // Subscribe to incoming channel/space updates
  channel.subscribe(channelEvents, (message) => {
    onUpdate(message.data, message.name as string)
  })
  // Return functions to send messages and cleanup
  return {
    unsubscribe: () => {
      channel.unsubscribe(channelEvents)
    }
  }
}

export const getUserRoles = (user: SelectUser): string[] => {
  const roles = (user?.role || "").split(",")
  return roles || []
}

export const isUserAdmin = (user: SelectUser): boolean => {
  return getUserRoles(user).includes("admin")
}

export const canUserIntract = (
  user: SelectUser,
  ownerId?: string | null
): boolean => {
  return isUserAdmin(user) || user.unique_id === ownerId ? true : false
}

export const generateUrl = (path: string) => {
  return `${window.location.origin}${path}`
}

export const getPagePath = (page: string) => {
  const targetPageMeta = pageMeta.find((meta) => meta.id === page)
  return targetPageMeta ? targetPageMeta.url : ""
}

export const removeEmojis = (string: string) => {
  const regex =
    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g
  return string.replace(regex, "")
}

export const isOnlyEmoji = (string: string) => {
  return !removeEmojis(string).length
}

export const formatFileSize = (sizeInBytes: number) => {
  const kb = sizeInBytes / 1024
  const mb = kb / 1024
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`
  }
  return `${kb.toFixed(2)} KB`
}


export const isEntityChannel = (entity: SelectChannel | SelectSpace): entity is SelectChannel => {
  return (entity as SelectChannel).channel_name !== undefined
}

export const isEntitySpace = (entity: SelectChannel | SelectSpace): entity is SelectSpace => {
  return (entity as SelectSpace).space_name !== undefined
}

export const getInitials = (string: string) => {
  return string.split(' ').map(word => word[0]?.toUpperCase()).join('');
}
export function ToUpperCase(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}