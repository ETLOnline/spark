// src/hooks/usePermissionChecker.ts

import { useCallback, useMemo, useState } from "react"
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

  useMemo(() => {
    if (permission || isSuperAdmin) {
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
    } else {
      const checker = new PermissionChecker(
        permissionType, // 'scoped'
        null,
        isSuperAdmin,
        entityType, // Only needed for scoped
        entityId // Only needed for scoped
      )
      setPermissionChecker(null)
    }
  }, [permission, isSuperAdmin, permissionType, entityType, entityId])

  const canAccess = useCallback(
    (permissionSlug: string): boolean => {
      if (permissionChecker) {
        return permissionChecker?.canAccess(permissionSlug) ?? false
      } else {
        return false
      }
    },
    [permissionChecker]
  )

  return { permissionChecker, canAccess }
}
