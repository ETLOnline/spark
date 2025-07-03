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
import { Users, Hash, Star, MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"

import { SelectCommunity } from "@/src/db/schema"
interface CommunityCardProps {
  community: SelectCommunity
  showStar?: boolean
  canManage?: boolean
  onEdit: (community: SelectCommunity) => void
  onDelete: (community: SelectCommunity) => void
}

export default function CommunityCard({
  community,
  showStar,
  canManage = false,
  onEdit,
  onDelete
}: CommunityCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={"/images/default-avatar.png"} />
            <AvatarFallback className="text-lg">
              {/* Ensure community.title is not null/undefined */}
              {(community.title || "")
                .split(" ")
                .map((word: string) => word[0])
                .join("")}
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
                    {/* {onEdit && ( */}
                    <DropdownMenuItem onClick={() => onEdit(community)}>
                      <Edit className="mr-2 h-4 w-4" /> {/* Added Edit icon */}
                      Edit
                    </DropdownMenuItem>
                    {/* )} */}
                    {/* {onDelete && ( */}
                    <DropdownMenuItem
                      onClick={() => onDelete(community)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />{" "}
                      {/* Added Trash2 icon */}
                      Delete
                    </DropdownMenuItem>
                    {/* )} */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{community.category}</Badge>
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
            <Users className="h-4 w-4" />
            <span>{community.communityMembers?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            <span>{community.channels?.length || 0} channels</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
