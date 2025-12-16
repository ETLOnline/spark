"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Trash2, UserPlus, X } from "lucide-react"
import Link from "next/link"
import { SelectUser, SelectUserChat } from "@/src/db/schema"
import { getUserRole } from "@/src/utils/helpers"
import { Input } from "@/src/components/ui/input"
import { useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"

interface GroupMembersDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentChatId: number
  members: SelectUserChat[]
  allSpaceUsers: SelectUser[]
  onAddMember: (userId: string) => Promise<void>
  onRemoveMember: (userId: string) => Promise<void>
}

export function GroupMembersDialog({
  isOpen,
  onOpenChange,
  currentChatId,
  members,
  allSpaceUsers,
  onAddMember,
  onRemoveMember
}: GroupMembersDialogProps) {
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const authUser = useAtomValue(userStore.AuthUser)
  const [showAddUsers, setShowAddUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  // Get users who are not in the group
  const memberIds = new Set(members.map((m) => m.user_id))
  const availableUsers = allSpaceUsers.filter(
    (user) => !memberIds.has(user.unique_id)
  )

  // Filter available users based on search
  const filteredAvailableUsers = availableUsers.filter((user) => {
    const query = searchQuery.toLowerCase()
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const email = user.email?.toLowerCase() || ""
    return fullName.includes(query) || email.includes(query)
  })

  const handleAddMember = async (userId: string) => {
    setLoadingUserId(userId)
    try {
      await onAddMember(userId)
      setSearchQuery("")
    } finally {
      setLoadingUserId(null)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    setLoadingUserId(userId)
    try {
      await onRemoveMember(userId)
    } finally {
      setLoadingUserId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Group Members ({members.length})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddUsers(!showAddUsers)}
              className="gap-2"
            >
              {showAddUsers ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Members
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {showAddUsers ? (
          <div className="space-y-4">
            <Input
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="h-[400px]">
              {filteredAvailableUsers.length > 0 ? (
                filteredAvailableUsers.map((user) => (
                  <div
                    key={user.unique_id}
                    className="flex items-center justify-between gap-2 mb-2 p-2 hover:bg-muted/55 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={user.profile_url || undefined}
                          alt={user.first_name}
                        />
                        <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getUserRole(user, currentSpace?.id)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddMember(user.unique_id)}
                      disabled={loadingUserId === user.unique_id}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery
                    ? "No users found"
                    : "All users are already in the group"}
                </p>
              )}
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between gap-2 mb-2 p-2 hover:bg-muted/55 rounded-md group"
              >
                <Link
                  href={`/profile/${member.user_id}`}
                  className="flex items-center gap-2 flex-1"
                >
                  <Avatar>
                    <AvatarImage
                      src={member.user?.profile_url || undefined}
                      alt={member.user?.first_name}
                    />
                    <AvatarFallback>
                      {member.user?.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.user?.first_name} {member.user?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user
                        ? getUserRole(member.user, currentSpace?.id)
                        : ""}
                    </p>
                  </div>
                </Link>
                {member.user_id !== authUser?.unique_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveMember(member.user_id)}
                    disabled={loadingUserId === member.user_id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}