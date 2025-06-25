// src/hooks/usePermissionChecker.ts

import { useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
export const usePermissionChecker = (
  permissionType: "scoped" | "global",
  entityType?: "SPACE" | "CHANNEL" | "PROJECT",
  entityId?: string
) => {
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)
  const permission = useAtomValue(userStore.Permissions)
  const [permissionChecker, setPermissionChecker] =
    useState<PermissionChecker | null>(null)

  useEffect(() => {
    if (
      (permission && !permissionChecker) ||
      (isSuperAdmin && !permissionChecker)
    ) {
      if (permissionType === "global") {
        const checker = new PermissionChecker(
          permissionType,
          permission,
          isSuperAdmin
        )
        setPermissionChecker(checker)
      } else {
        const checker = new PermissionChecker(
          permissionType, // 'scoped'
          permission,
          isSuperAdmin,
          entityType, // Only needed for scoped
          entityId // Only needed for scoped
        )
        setPermissionChecker(checker)
      }
    }
  }, [
    permission,
    permissionChecker,
    setPermissionChecker,
    isSuperAdmin,
    permissionType,
    entityType,
    entityId
  ])

  const canAccess = (permissionSlug: string): boolean => {
    return permissionChecker?.canAccess(permissionSlug) ?? false
  }

  return { permissionChecker, canAccess }
}
