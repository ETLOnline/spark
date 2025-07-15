"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Users,
  Hash,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Lock,
  Globe,
  User
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"

import { SelectCommunity } from "@/src/db/schema"
import Link from "next/link"
import { getInitials } from "@/src/utils/helpers"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
interface CommunityCardProps {
  community: SelectCommunity
  showStar?: boolean
  canManage?: boolean
  onEdit: (community: SelectCommunity) => void
  onDelete: (community: SelectCommunity) => void
}

export default function CommunityCard({
  community,
  onEdit,
  onDelete
}: CommunityCardProps) {
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    community.id
  )
  const allowAction = permissionChecker
    ? permissionChecker?.canAccess("community.allow.action")
    : false
  const canEdit = permissionChecker
    ? permissionChecker?.canAccess("community.update")
    : false
  const canDelete = permissionChecker
    ? permissionChecker?.canAccess("community.delete")
    : false
  const canView = permissionChecker
    ? permissionChecker?.canAccess("community.view")
    : false

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
            <AvatarImage src={"/images/default-avatar.png"} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white dark:from-blue-600 dark:to-purple-700">
              {getInitials(community.title)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between gap-2">
              {" "}
              {/* Added justify-between for spacing */}
              <CardTitle className="text-xl font-bold">
                {community.title}
              </CardTitle>
              {/* Right-aligned content in the header */}
              {allowAction && (
                <div className="flex items-center gap-2">
                  {/* Only show if canManage is true AND relevant callbacks are provided */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      {/* Use shadcn/ui Button as trigger for consistent styling and accessibility */}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />{" "}
                        {/* Changed from MoreHorizontal to MoreVertical */}
                        <span className="sr-only">Community actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => onEdit(community)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/communities/${community.slug}/users`}>
                          <User className="mr-2 h-4 w-4" />
                          User
                        </Link>
                      </DropdownMenuItem>
                      {canView && (
                        <DropdownMenuItem asChild>
                          <Link href={`/communities/${community.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Detail
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(community)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />{" "}
                          {/* Added Trash2 icon */}
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{community?.category?.name}</Badge>
              {community.type === "public" ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : community.type === "private" ? (
                <Lock className="h-4 w-4 text-yellow-500" />
              ) : null}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{community.communityMembers?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {community.description}
        </CardDescription>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            <span>{community.channels?.length || 0} channels</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href={`/communities/${community.slug}`}>
              <Button variant="outline">View</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
