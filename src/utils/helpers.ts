import { pageMeta } from "@/src/utils/constants"
import { ProfileActivity } from "../components/Dashboard/Connections/types/connections.types"
import {
  InsertNotification,
  SelectChannel,
  SelectCommunity,
  SelectRole,
  SelectSpace,
  SelectUser,
  SelectUserRole
} from "../db/schema"
import { AblyClient } from "../services/realtime/AblyClient"
import moment from "moment-timezone"
import { CommunityDetailData } from "../db/data-access/communities/query"
export type RoleWithPermissions = {
  id: number
  name: string
  userCount: number
  isGlobal: boolean
  permissions: number[]
}

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

export const generateUrl = (path: string) => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`
  }
  return path // Return just the path on server-side
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

export const isEntityCommunity = (
  entity: CommunityDetailData | SelectChannel | SelectSpace | SelectCommunity
): entity is CommunityDetailData | SelectCommunity => {
  return (
    (entity as CommunityDetailData).title !== undefined ||
    (entity as SelectCommunity).slug !== undefined
  )
}

export const isEntityChannel = (
  entity: SelectChannel | SelectSpace | CommunityDetailData | SelectCommunity
): entity is SelectChannel => {
  return (entity as SelectChannel).channel_name !== undefined
}

export const isEntitySpace = (
  entity: SelectChannel | SelectSpace | CommunityDetailData | SelectCommunity
): entity is SelectSpace => {
  return (entity as SelectSpace).space_name !== undefined
}

export const getInitials = (string: string) => {
  return string
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .join("")
}
export function ToUpperCase(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const checkUserPersonaCompletion = async (user: SelectUser) => {
  if (await isSuperAdmin(user)) {
    return true
  }
  if (!user.roles || user.roles.length === 0) {
    return false
  }
  const hasGlobalRole = user.roles.find(
    (userRole: SelectUserRole) => userRole.role?.role_type === "GLOBAL"
  )
  return hasGlobalRole
}

export const rolesUserCount = (roles: any) => {
  const rolesWithUserCount = roles.map((role: any) => ({
    ...role,
    user_count: role.users ? role.users.length : 0
  }))

  return rolesWithUserCount
}

type RawPermission = {
  id: number
  namespace: string
  action: string
}

export type GroupedPermission = {
  id: string
  name: string
  permissions: {
    id: number
    key: string
    name: string
  }[]
}

export function groupPermissionsByNamespace(
  permissions: RawPermission[]
): GroupedPermission[] {
  const grouped = new Map<string, GroupedPermission>()

  for (const p of permissions) {
    if (!grouped.has(p.namespace)) {
      grouped.set(p.namespace, {
        id: p.namespace,
        name: capitalize(p.namespace),
        permissions: []
      })
    }

    grouped.get(p.namespace)!.permissions.push({
      id: p.id,
      key: `${p.namespace}.${p.action}`,
      name: formatAction(p.action)
    })
  }

  return Array.from(grouped.values())
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatAction(action: string): string {
  return action.split("_").map(capitalize).join(" ")
}

export function transformSingleRoleWithPermissions(
  role: SelectRole
): RoleWithPermissions {
  return {
    id: role.id,
    name: role.name,
    userCount: role.users?.length ?? 0,
    isGlobal: role.role_type === "GLOBAL",
    permissions: role.permissions?.map((p) => p.permission_id) ?? []
  }
}

export function getOptionsFromUserList(users: SelectUser[]) {
  return users.map((user) => {
    return {
      label: `${user.first_name} ${user.last_name}`,
      value: user.unique_id
    }
  })
}

type SerializableUserPerms = {
  global: string[]
  scoped: {
    [entityType: string]: {
      [entityId: string]: string[]
    }
  }
}

export function serializeUserPerms(userPerms: {
  global: Set<string>
  scoped: {
    [entityType: string]: {
      [entityId: string]: Set<string>
    }
  }
}): SerializableUserPerms {
  return {
    global: Array.from(userPerms.global),
    scoped: Object.fromEntries(
      Object.entries(userPerms.scoped).map(([entityType, entityMap]) => [
        entityType,
        Object.fromEntries(
          Object.entries(entityMap).map(([entityId, permSet]) => [
            entityId,
            Array.from(permSet)
          ])
        )
      ])
    )
  }
}

export async function isSuperAdmin(user: SelectUser): Promise<boolean> {
  try {
    if (!user.roles || user.roles.length === 0) {
      return false
    }
    const isSuperAdmin = user.roles.some(
      (userRole: SelectUserRole) =>
        userRole.role?.role_type === "SYSTEM" &&
        userRole.role?.name === "Super_Admin"
    )
    return isSuperAdmin
  } catch (error) {
    console.error("Error checking if user is super admin:", error)
    return false
  }
}

export const formatRelativeTime = (
  dateString: string | null | undefined
): string => {
  return moment
    .utc(dateString || "")
    .local()
    .fromNow()
}

export const GetUserRole = (user: SelectUser) => {
  if (user.roles && user.roles.length > 0) {
    console.log("userRoles", user.roles)

    return user.roles.flatMap((ur) =>
      ur.role?.role_type === "GLOBAL" ? ur.role.name : []
    )
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
}
