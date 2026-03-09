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
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
        <p className="text-muted-foreground">
          Discover and join communities that match your interests
        </p>
      </div>
      {/* Attach the onCreateCommunityClick prop to the Button's onClick event */}
      {!permissionChecker ? null : canCreateCommunity ? (
        <Button onClick={onCreateCommunityClick}>
          <CirclePlus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      ) : (
        <Button onClick={() => route.push("/communities/request")}>
          Request to Create Community
        </Button>
      )}
    </div>
  )
}
