"use client"

import { useAtomValue } from "jotai"
import { usePermissionChecker } from "./usePermissionChecker"
import { spaceStore } from "@/src/store/space/spaceStore"
import { permissions } from "@/src/utils/constants"

export function useMilestonePermissions() {
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const spaceId = currentSpace?.id

  const { permissionChecker: globalChecker } = usePermissionChecker("global")

  const { permissionChecker: spaceChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    spaceId
  )

  const canFyp = (action: string): boolean => {
    const key = `fyp.${action}`
    return (
      (globalChecker?.canAccess(key) ?? false) ||
      (spaceChecker?.canAccess(key) ?? false)
    )
  }

  const canAdvisory = (action: string): boolean => {
    const key = `advisory.${action}`
    return (
      (globalChecker?.canAccess(key) ?? false) ||
      (spaceChecker?.canAccess(key) ?? false)
    )
  }

  const canCreateMilestone = canAdvisory(permissions.advisory.milestoneCreate)
  const canUpdateMilestone = canAdvisory(permissions.advisory.milestoneUpdate)
  const canDeleteMilestone = canAdvisory(permissions.advisory.milestoneDelete)
  const canVerifyMilestone = canAdvisory(permissions.advisory.milestoneVerify)
  const canRevertMilestone = canAdvisory(permissions.advisory.milestoneRevert)

  const canManage =
    canCreateMilestone ||
    canUpdateMilestone ||
    canDeleteMilestone ||
    canVerifyMilestone ||
    canRevertMilestone

  const canArtifactAdd = canFyp(permissions.fyp.milestoneArtifactAdd)
  const canArtifactDelete = canFyp(permissions.fyp.milestoneArtifactDelete)
  const canMarkDone = canFyp(permissions.fyp.milestoneMarkDone)

  return {
    canManage,
    canCreateMilestone,
    canUpdateMilestone,
    canDeleteMilestone,
    canVerifyMilestone,
    canRevertMilestone,
    canArtifactAdd,
    canArtifactDelete,
    canMarkDone
  }
}
