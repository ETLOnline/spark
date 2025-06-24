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

export function buildUserPerms(rows: RawPermissionRow[]): RawUserPerms {
  const global: string[] = []
  const scoped: RawUserPerms["scoped"] = {}

  for (const row of rows) {
    const key = `${row.namespace}.${row.action}`

    if (!row.entity_type || !row.entity_id) {
      global.push(key)
    } else {
      if (!scoped[row.entity_type]) scoped[row.entity_type] = {}
      if (!scoped[row.entity_type][row.entity_id])
        scoped[row.entity_type][row.entity_id] = []

      scoped[row.entity_type][row.entity_id].push(key)
    }
  }

  return {
    global: global.length ? global : [],
    scoped: Object.keys(scoped).length ? scoped : undefined
  }
}
