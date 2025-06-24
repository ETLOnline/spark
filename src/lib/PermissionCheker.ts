import { UserPerms } from "../utils/clientHelper"

export class PermissionChecker {
  private scope: "global" | "scoped"
  private userPermissions: UserPerms | null
  public isSuperAdmin: boolean
  private entityType?: string
  private entityId?: string

  constructor(
    scope: "global" | "scoped",
    userPermissions?: UserPerms | null,
    isSuperAdmin: boolean = false,
    entityType?: string,
    entityId?: string
  ) {
    this.scope = scope
    this.userPermissions = userPermissions ?? null
    this.isSuperAdmin = isSuperAdmin
    this.entityType = entityType
    this.entityId = entityId
  }

  canAccess(action: string): boolean {
    if (this.isSuperAdmin) return true
    if (!this.userPermissions) return false

    if (this.scope === "global") {
      const currentUserPermissions = this.userPermissions.global
      console.log(currentUserPermissions)
      return currentUserPermissions.has(action)
    }

    if (!this.entityType || !this.entityId) return false

    return (
      this.userPermissions.scoped?.[this.entityType]?.[this.entityId]?.has(
        action
      ) ?? false
    )
  }
}
