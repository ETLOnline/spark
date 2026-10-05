"use client"

import { useEffect, useState, useCallback } from "react"
import { useAtomValue } from "jotai"
import { LayoutList } from "lucide-react"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useMilestonePermissions } from "@/src/hooks/useMilestonePermissions"
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
  const [view, setView] = useState<View>("milestones")
  const [milestones, setMilestones] = useState<MilestoneWithArtifacts[]>([])
  const [loadingMs, setLoadingMs] = useState(true)
  const [, , , fetchMilestones] = useServerAction(GetMilestonesForSpaceAction)

  const {
    canManage,
    canCreateMilestone,
    canUpdateMilestone,
    canDeleteMilestone,
    canVerifyMilestone,
    canRevertMilestone,
    canArtifactAdd
  } = useMilestonePermissions()

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
      canArtifactAdd={canArtifactAdd}
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
