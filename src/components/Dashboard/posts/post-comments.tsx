'use client';

import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { SelectComment } from "@/src/db/schema"
import { formatRelativeTime } from "@/src/utils/helpers"
import ExpandableText from "./ExpandableText"
import { Button } from "@/src/components/ui/button"
import { MoreVertical, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"

type Props = {
  comment: SelectComment
  onEdit?: (comment: SelectComment) => void
}

const PostComments: React.FC<Props> = ({ comment, onEdit }) => {
  const name = `${comment.commentor.first_name} ${comment.commentor.last_name}`
  const user = useAtomValue(userStore.AuthUser)
  const isOwnComment = true // user?.unique_id === comment.commentor.unique_id

  const initials = `${comment.commentor.first_name?.[0] ?? ""}${comment.commentor.last_name?.[0] ?? ""}`

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 flex flex-col w-full gap-3 transition-colors hover:bg-accent/30">
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-border/50">
            <AvatarImage
              src={comment.commentor.profile_url as string || "/placeholder.svg"}
              alt={name}
            />
            <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="font-semibold text-sm leading-tight text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatRelativeTime(comment.created_at || "")}
            </p>
          </div>
        </div>

        {isOwnComment && onEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Comment options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onEdit(comment)} className="cursor-pointer">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="pl-12">
        <ExpandableText content={comment.content} lines={3} />
      </div>
    </div>
  )
}

export default PostComments
