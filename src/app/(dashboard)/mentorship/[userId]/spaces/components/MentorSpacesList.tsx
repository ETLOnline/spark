"use client"

import { useEffect, useState } from "react"
import { LayoutGrid } from "lucide-react"
import { Skeleton } from "@/src/components/ui/skeleton"
import PaginationComponent from "@/src/components/common/Pagination"
import type { PaginationType } from "@/src/components/common/types/pagination.type"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSpacesByCreatorAction } from "@/src/server-actions/Space/Space"
import type { SelectSpace } from "@/src/db/schema"
import SpacesCard from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/SpacesCard"

const SPACES_PAGE_SIZE = 9

interface Props {
  userId: string
}

export default function MentorSpacesList({ userId }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [spaceData, setSpaceData] = useState<{
    spaces: SelectSpace[]
    pagination: PaginationType
  }>({
    spaces: [],
    pagination: { total: 0, page: 1, limit: SPACES_PAGE_SIZE, totalPages: 0 }
  })
  const [loading, , , fetchSpaces] = useServerAction(GetSpacesByCreatorAction)

  useEffect(() => {
    const load = async () => {
      const res = await fetchSpaces(userId, currentPage, SPACES_PAGE_SIZE)
      if (res?.success && res.data) {
        setSpaceData({
          spaces: res.data.spaces,
          pagination: res.data.pagination
        })
      }
    }
    load()
  }, [userId, currentPage])

  const { spaces, pagination } = spaceData

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <LayoutGrid className="h-10 w-10" />
        <p className="text-sm">You don&apos;t have any spaces yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <SpacesCard key={space.id} space={space} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <PaginationComponent
          pagination={pagination}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
