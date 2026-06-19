import { Button } from "@/src/components/ui/button"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { CirclePlus } from "lucide-react"
import { useRouter } from "next/navigation"

type CommunitiesHeaderProps = {
  onCreateCommunityClick: () => void
}

export default function CommunitiesHeader({
  onCreateCommunityClick
}: CommunitiesHeaderProps) {
  const { permissionChecker } = usePermissionChecker("global")
  const canCreateCommunity = permissionChecker
    ? permissionChecker?.canAccess("community.create")
    : false

  const route = useRouter()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 py-3 gap-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Communities</h1>
        <p className="text-muted-foreground text-xs">
          Discover and join communities that match your interests
        </p>
      </div>
      {!permissionChecker ? null : canCreateCommunity ? (
        <Button
          onClick={onCreateCommunityClick}
          size="sm"
          className="w-full sm:w-auto"
        >
          <CirclePlus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      ) : null}
    </div>
  )
}
