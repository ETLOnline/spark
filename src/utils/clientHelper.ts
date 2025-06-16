import { useUser } from "@clerk/nextjs"

// Define raw shape that matches what Clerk stores
type RawUserPerms = {
  global?: string[]
  scoped?: {
    [entityType: string]: {
      [entityId: string]: string[]
    }
  }
}

type UserPerms = {
  global: Set<string>
  scoped: {
    [entityType: string]: {
      [entityId: string]: Set<string>
    }
  }
}

export function useCanAccess(
  permission: string,
  scope: "global" | "scoped",
  entityType?: string,
  entityId?: string
): boolean {
  const { user } = useUser()
  const rawPerms = user?.publicMetadata?.permissions as RawUserPerms | undefined

  if (!rawPerms) return false

  // Convert to Set-based structure
  const perms: UserPerms = {
    global: new Set(rawPerms.global || []),
    scoped: {}
  }

  if (rawPerms.scoped) {
    for (const type in rawPerms.scoped) {
      perms.scoped[type] = {}
      for (const id in rawPerms.scoped[type]) {
        perms.scoped[type][id] = new Set(rawPerms.scoped[type][id])
      }
    }
  }

  // Permission logic
  if (scope === "global") {
    return perms.global.has(permission)
  }

  if (!entityType || !entityId) return false

  return perms.scoped?.[entityType]?.[entityId]?.has(permission) ?? false
}
