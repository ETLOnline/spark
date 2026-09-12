"use client"

import { useAtomValue } from "jotai"
import { usePermissionChecker } from "./usePermissionChecker"
import { spaceStore } from "@/src/store/space/spaceStore"

export function useMilestonePermissions() {
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const communityId = currentSpace?.channel?.community_id ?? undefined
  const spaceId = currentSpace?.id

  const { permissionChecker: globalChecker } = usePermissionChecker("global")
  const { permissionChecker: scopedChecker } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    communityId
  )
  const { permissionChecker: spaceChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    spaceId
  )

  // Both advisors (global) and students require space.update (space editor role).
  // Community admins are scoped to COMMUNITY instead.
  const isSpaceEditor = spaceChecker?.canAccess("space.update") ?? false

  const canFyp = (action: string): boolean => {
    const isAdvisor = globalChecker?.canAccess(action) ?? false
    const isCommunityAdmin = scopedChecker?.canAccess(action) ?? false
    if (isAdvisor) return isSpaceEditor
    return isCommunityAdmin
  }

  const canCreateMilestone = canFyp("fyp.milestone.create")
  const canUpdateMilestone = canFyp("fyp.milestone.update")
  const canDeleteMilestone = canFyp("fyp.milestone.delete")
  const canVerifyMilestone = canFyp("fyp.milestone.verify")
  const canRevertMilestone = canFyp("fyp.milestone.revert")

  const canManage =
    canCreateMilestone ||
    canUpdateMilestone ||
    canDeleteMilestone ||
    canVerifyMilestone ||
    canRevertMilestone

  const canArtifactAdd =
    isSpaceEditor &&
    (globalChecker?.canAccess("fyp.milestone.artifact.add") ?? false)

  const canArtifactDelete =
    (isSpaceEditor &&
      (globalChecker?.canAccess("fyp.milestone.artifact.delete") ?? false)) ||
    canFyp("fyp.milestone.artifact.delete")

  const canMarkDone =
    isSpaceEditor &&
    (globalChecker?.canAccess("fyp.milestone.mark_done") ?? false)

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
