import { Skeleton } from "@/src/components/ui/skeleton"

interface CommunitySkeletonCardsProps {
  count?: number
}

export default function CommunitySkeletonCards({
  count = 6
}: CommunitySkeletonCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
      ))}
    </div>
  )
}
