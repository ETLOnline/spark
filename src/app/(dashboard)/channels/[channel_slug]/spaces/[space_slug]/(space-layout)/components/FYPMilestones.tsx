"use client"

import { useEffect, useState, useCallback } from "react"
import { useAtomValue } from "jotai"
import { LayoutList } from "lucide-react"
import { spaceStore } from "@/src/store/space/spaceStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetMilestonesForSpaceAction } from "@/src/server-actions/Milestone/Milestone"
import type { MilestoneWithArtifacts } from "@/src/server-actions/Milestone/Milestone"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { MilestoneSetup } from "./MilestoneSetup"
import { MilestoneView } from "./MilestoneView"

// ─── Types ─────────────────────────────────────────────────────────────────────

type View = "setup" | "milestones"

// ─── Main Component ───────────────────────────────────────────────────────────

function FYPMilestones() {
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const spaceId = currentSpace?.id
  const communityId = currentSpace?.channel?.community_id ?? undefined
  const [view, setView] = useState<View>("milestones")
  const [milestones, setMilestones] = useState<MilestoneWithArtifacts[]>([])
  const [loadingMs, setLoadingMs] = useState(true)
  const [, , , fetchMilestones] = useServerAction(GetMilestonesForSpaceAction)

  // industry_partner: fyp permissions are GLOBAL
  // community_admin: fyp permissions are SCOPED to COMMUNITY (entity_type='COMMUNITY')
  const { permissionChecker: globalChecker } = usePermissionChecker("global")
  const { permissionChecker: scopedChecker } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    communityId
  )
  // Space-scoped checker — used to verify advisor has space_admin or space_editor (not just space_viewer)
  const { permissionChecker: spaceChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    spaceId
  )

  // Check a fyp permission against both global (advisor) and community-scoped (university admin) checkers.
  // Advisors (global) must also have space.update — i.e. be space_admin or space_editor, not space_viewer.
  const canFyp = (action: string): boolean => {
    const isAdvisor = globalChecker?.canAccess(action) ?? false
    const isCommunityAdmin = scopedChecker?.canAccess(action) ?? false
    if (isAdvisor) {
      return spaceChecker?.canAccess("space.update") ?? false
    }
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

  const load = useCallback(async () => {
    if (!spaceId) return
    setLoadingMs(true)
    try {
      const res = await fetchMilestones(spaceId)
      if (res?.success && res.data) {
        setMilestones(res.data as MilestoneWithArtifacts[])
        setView(res.data.length > 0 ? "milestones" : "setup")
      }
    } finally {
      setLoadingMs(false)
    }
  }, [spaceId])

  useEffect(() => {
    load()
  }, [load])

  if (loadingMs) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  if (view === "setup" && !canManage) {
    return (
      <NoDataCard
        icon={<LayoutList className="h-16 w-16 text-muted-foreground mb-4" />}
        title="No milestones yet"
        description="Your Advisor or University Admin will set up your project milestones. Check back here once they're configured."
      />
    )
  }

  if (view === "setup") {
    return (
      <MilestoneSetup
        spaceId={spaceId!}
        initialMilestones={milestones.length > 0 ? milestones : undefined}
        onCancel={
          milestones.length > 0 ? () => setView("milestones") : undefined
        }
        onComplete={(created) => {
          setMilestones(created)
          setView("milestones")
        }}
        onMilestoneDeleted={(deletedId) =>
          setMilestones((prev) => prev.filter((m) => m.id !== deletedId))
        }
      />
    )
  }

  return (
    <MilestoneView
      milestones={milestones}
      canManage={canManage}
      canCreateMilestone={canCreateMilestone}
      canUpdateMilestone={canUpdateMilestone}
      canDeleteMilestone={canDeleteMilestone}
      canVerifyMilestone={canVerifyMilestone}
      canRevertMilestone={canRevertMilestone}
      onSetupAgain={() => setView("setup")}
      onMilestoneDeleted={(deletedId) =>
        setMilestones((prev) => prev.filter((m) => m.id !== deletedId))
      }
    />
  )
}

export default FYPMilestones
