import { CommunityDetailData } from "../db/data-access/communities/query"
import {
  SelectChannel,
  SelectChat,
  SelectCommunity,
  SelectSpace
} from "../db/schema"
import { isEntityChannel, isEntityCommunity, isEntitySpace } from "./helpers"

export type RawUserPerms = {
  global?: string[]
  scoped?: {
    [entityType: string]: {
      // channel | chat
      [entityId: string]: string[] // posting.create chat.create
    }
  }
}

export type UserPerms = {
  global: Set<string>
  scoped: {
    [entityType: string]: {
      [entityId: string]: Set<string>
    }
  }
}

const defaultPermissions: UserPerms = {
  global: new Set(),
  scoped: {}
}

export function transformRawPermsToSet(
  rawPerms?: RawUserPerms
): UserPerms | null {
  if (!rawPerms) return null

  const global = new Set(Array.isArray(rawPerms.global) ? rawPerms.global : [])

  const scoped: UserPerms["scoped"] = {}

  if (rawPerms.scoped) {
    for (const entityType in rawPerms.scoped) {
      scoped[entityType] = {}

      for (const entityId in rawPerms.scoped[entityType]) {
        const permissionArray = rawPerms.scoped[entityType][entityId] || []
        scoped[entityType][entityId] = new Set(permissionArray)
      }
    }
  }

  return { global, scoped }
}

export interface RawPermissionRow {
  namespace: string
  action: string
  entity_type: string | null
  entity_id: string | null
}

export function buildUserPerms(rows: RawPermissionRow[]): UserPerms {
  const global: Set<string> = new Set()
  const scoped: UserPerms["scoped"] = {}

  for (const row of rows) {
    const key = `${row.namespace}.${row.action}`

    if (!row.entity_type || !row.entity_id) {
      global.add(key)
    } else {
      if (!scoped[row.entity_type]) scoped[row.entity_type] = {}
      if (!scoped[row.entity_type][row.entity_id])
        scoped[row.entity_type][row.entity_id] = new Set()

      scoped[row.entity_type][row.entity_id].add(key)
    }
  }

  return {
    global,
    scoped: Object.keys(scoped).length ? scoped : {}
  }
}

// Entity is channel or space or community
export function isEntityUser(
  entity: SelectChannel | SelectSpace | SelectCommunity | CommunityDetailData,
  currentUserId: string
): boolean {
  if (isEntityChannel(entity) || isEntitySpace(entity) || "users" in entity) {
    return (
      entity.users?.some(
        (u: { user_id: string }) => u.user_id === currentUserId
      ) ?? false
    )
  }

  if (isEntityCommunity(entity)) {
    return (
      entity.communityMembers?.some(
        (m: { user_id: string }) => m.user_id === currentUserId
      ) ?? false
    )
  }

  return false
}

export function prepareTaskEmailData(task: any, oldTask: any) {
  const assigneeName = task.assignee
    ? `${task.assignee.first_name} ${task.assignee.last_name}`.trim()
    : "Unassigned"

  const oldAssigneeName = oldTask.assignee
    ? `${oldTask.assignee.first_name} ${oldTask.assignee.last_name}`.trim()
    : "Unassigned"

  const assignorName = task.assignor
    ? `${task.assignor.first_name} ${task.assignor.last_name}`.trim()
    : "System"

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const changes: { [key: string]: { oldValue: any; newValue: any } } = {}

  // Compare fields and log changes
  if (oldTask.task_title !== task.task_title) {
    changes.task_title = {
      oldValue: oldTask.task_title,
      newValue: task.task_title
    }
  }
  if (oldTask.task_priority !== task.task_priority) {
    changes.priority = {
      oldValue: oldTask.task_priority,
      newValue: task.task_priority
    }
  }
  if (oldTask.assignee?.id !== task.assignee?.id) {
    changes.assignee = { oldValue: oldAssigneeName, newValue: assigneeName }
  }
  if (oldTask.task_type !== task.task_type) {
    changes.issue_type = {
      oldValue: oldTask.task_type,
      newValue: task.task_type
    }
  }
  if (oldTask.status?.id !== task.status?.id) {
    const oldStatus = oldTask.status ? oldTask.status.name : "N/A"
    const newStatus = task.status ? task.status.name : "N/A"
    changes.status = { oldValue: oldStatus, newValue: newStatus }
  }
  const logoUrl = getSiteLogoUrl()
  const taskUrl = createAbsoluteUrl(
    `/project/${task.project_id}/task/${task.id}`
  )

  return {
    logo_url: logoUrl,
    task_title: task.task_title || "N/A",
    task_id: task.task_num || "N/A",
    project_name: task.project_name || "N/A",
    priority: task.task_priority || "N/A",
    assignee_name: assigneeName,
    assignor_name: assignorName,
    issue_type: task.task_type || "N/A",
    description: task.description || "No description provided.",
    task_url: taskUrl,
    changes: changes
  }
}

export function createAbsoluteUrl(relativePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_BASE_URL is not defined in environment variables."
    )
  }

  try {
    const url = new URL(relativePath, baseUrl)
    return url.toString()
  } catch (error) {
    console.error(
      `Invalid URL creation with base: ${baseUrl} and path: ${relativePath}`
    )
    throw error
  }
}
export function getSiteLogoUrl(): string {
  const LOGO_PATH = "/logo/spark-logo-animated-themed.gif"
  return createAbsoluteUrl(LOGO_PATH)
}
export function resolveAccept(
  accept?: string,
  fileType?: "file" | "image"
): string | undefined {
  const nonImageAccept =
    ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint"

  if (accept) return accept
  return fileType === "image" ? "image/*" : nonImageAccept
}
export function computeTypingLabel({
  chat,
  typingUsers,
  authUserId
}: {
  chat: SelectChat
  typingUsers: Record<string, Set<string>> | undefined
  authUserId: string | null | undefined
}): string {
  if (!typingUsers) return ""

  const chatTypers = typingUsers[chat.id] || new Set<string>()
  if (chatTypers.size === 0) return ""

  const memberIds = (chat.users || []).map((u) => u.user_id).filter(Boolean)

  const typers = memberIds.filter(
    (id) => chatTypers.has(id) && id !== authUserId
  )

  if (typers.length === 0) return ""

  if (!chat.is_group) return "typing..."

  const names = (chat.users || [])
    .filter((u) => typers.includes(u.user_id))
    .map((u) => u.user?.first_name)
    .filter(Boolean)
    .slice(0, 3)

  return names.length > 0 ? `${names.join(", ")} typing...` : "typing..."
}

import { parseMentions } from "@/src/services/realtime/utils/helper"

export function parseLastMessageType(rawMessage: string | null) {
  if (!rawMessage) return { type: "text", content: "" }

  const imgRegex = /<img\s+[^>]*src=(['"])(.*?)\1[^>]*>/i
  const imgMatch = rawMessage.match(imgRegex)
  if (imgMatch) {
    const src = imgMatch[2] || ""
    return { type: "image", filename: src }
  }

  const tokens = parseMentions(rawMessage || "")
  const lastMessage = tokens
    .map((t) => (t.type === "mention" ? `@${t.value}` : t.value))
    .join("")

  const parts = rawMessage.split(",")
  if (parts.length >= 4) {
    const filePath = (parts[0] || "").trim()
    const filename = (parts[1] || "").trim()
    const sizeStr = (parts[2] || "").trim()
    const mime = (parts[3] || "").trim()

    const isUrl = /^https?:\/\//i.test(filePath)
    const isSizeNumeric = /^\d+$/.test(sizeStr)
    const isMimeLike = mime.includes("/")

    if (isUrl && filename && isSizeNumeric && isMimeLike) {
      if (mime.startsWith("image/")) {
        return { type: "image", filename }
      }
      return { type: "file", filename }
    }
  }

  return { type: "text", content: lastMessage }
}

export function getFriendlyAcceptLabel(
  accept?: string,
  fileType?: "file" | "image"
) {
  if (fileType === "image") return "Images (jpg, png, gif, webp)"

  if (!accept) return "Files (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip)"

  const parts = accept
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
  const readable = parts
    .map((p) => {
      if (p.startsWith(".")) return p
      const idx = p.lastIndexOf("/")
      return idx !== -1 ? p.slice(idx + 1) : p
    })
    .slice(0, 6)

  return readable.join(", ")
}

export function progressPercentHelper(
  userRPPoints: number,
  minPoints: number,
  maxPoints: number
) {
  const result =
    maxPoints > minPoints
      ? Math.round(((userRPPoints - minPoints) / (maxPoints - minPoints)) * 100)
      : 0
  return result
}

// Example usage:
// community_service -> Community Service
// profile_complete -> Profile Complete
export const formatActivityName = (text: string) => {
  if (!text) return ""

  return text.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

export function normalizeUrl(val: string): string {
  if (!val || val.trim() === "") return val
  const trimmed = val.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function isValidUrl(val: string): boolean {
  if (!val || val.trim() === "") return true
  try {
    new URL(normalizeUrl(val))
    return true
  } catch {
    return false
  }
}
