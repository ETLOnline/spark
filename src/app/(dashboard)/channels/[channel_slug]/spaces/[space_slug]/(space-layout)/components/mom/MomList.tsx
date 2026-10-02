"use client"

import { ClipboardEdit, Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import MomCard from "./MomCard"
import { SelectMom } from "@/src/db/schema"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"

interface MomListProps {
  moms: SelectMom[]
  participantNameById: Record<string, string>
  onEdit: (mom: SelectMom) => void
  onDelete: (momId: string) => void
  getMomLoading?: boolean
}

function MomList({
  moms,
  participantNameById,
  onEdit,
  onDelete,
  getMomLoading
}: MomListProps) {
  if (moms.length === 0) {
    return (
      <div className="space-y-4">
        <NoDataCard
          icon={
            <ClipboardEdit className="h-16 w-16 text-muted-foreground mb-4" />
          }
          title="No Minutes Logged Yet"
          description="Log your first meeting to start keeping track of discussions and decisions."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {getMomLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader size={LoaderSizes.xl} />
        </div>
      ) : (
        moms.map((mom) => (
          <MomCard
            key={mom.id}
            mom={mom}
            participantNameById={participantNameById}
            onEdit={() => onEdit(mom)}
            onDelete={() => onDelete(mom.id)}
          />
        ))
      )}
    </div>
  )
}

export default MomList
