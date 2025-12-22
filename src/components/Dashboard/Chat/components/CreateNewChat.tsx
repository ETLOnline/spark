"use client"
import React, { useEffect, useState } from "react"
import { PlusCircle, Users, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import { Button } from "@/src/components/ui/button"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateGroupChatAction,
  CreatePrivateChatAction,
  GetChatContactsAction,
  AddUserToGroupChatAction,
  RemoveUserFromGroupChatAction
} from "@/src/server-actions/Chat/Chat"
import { useParams } from "next/navigation"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useDebouncedCallback } from "use-debounce"
import { SelectChat, SelectUser } from "@/src/db/schema"
import { spaceStore } from "@/src/store/space/spaceStore"
import { ChatContactFilters } from "@/src/db/data-access/chat/query"
import { Input } from "@/src/components/ui/input"
import Avvvatars from "avvvatars-react"
import Image from "next/image"
import { chatStore } from "@/src/store/chat/chatStore"
import { toast } from "@/src/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Label } from "@/src/components/ui/label"

interface CreateNewChatProps {
  mode?: "create" | "manage"
  currentChat?: SelectChat | null
  onSuccess?: () => void
  canDelete?: boolean
}

const CreateNewChat = ({
  mode = "create",
  currentChat = null,
  onSuccess,
  canDelete
}: CreateNewChatProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<MultiSelectOption[]>(
    []
  )
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const setMyChats = useSetAtom(chatStore.myChats)
  const switchChat = useSetAtom(chatStore.switchedChat)
  const setIsMobileMenuOpen = useSetAtom(chatStore.isMobileMenuOpen)

  const [loading, state, error, FindUsers] = useServerAction(
    GetChatContactsAction
  )
  const [, , , addUserToGroup] = useServerAction(AddUserToGroupChatAction)
  const [, , , removeUserFromGroup] = useServerAction(
    RemoveUserFromGroupChatAction
  )

  const [isGroupChat, setIsGroupChat] = useState(false)
  const [groupName, setGroupName] = useState<string>("")
  const [groupNameError, setGroupNameError] = useState<string>("")
  const [options, setOptions] = useState<MultiSelectOption[]>([])
  const { space_slug } = useParams()
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const [contactFilter, setContactFilter] = useState<ChatContactFilters>()

  const isSpacePage = space_slug ? true : false
  const isManageMode = mode === "manage" && currentChat?.is_group
  const existingMemberIds = new Set(
    currentChat?.users?.map((u) => u.user_id) || []
  )
  const isCreator = currentChat?.created_by === authUser?.unique_id
  const hasPermission = !currentChat?.created_by || isCreator

  const getOptionsFromUserList = (users: SelectUser[]) => {
    return users
      .filter((user) => {
        if (user.unique_id === authUser?.unique_id) return false
        if (isManageMode && existingMemberIds.has(user.unique_id)) return false
        return true
      })
      .map((user) => {
        return {
          label: `${user.first_name} ${user.last_name}`,
          value: user.unique_id
        }
      })
  }

  const getUserList = async (filters: ChatContactFilters) => {
    const response = await FindUsers({
      user_id: filters.user_id,
      query: filters.query,
      space_id: filters.space_id
    })
    if (response?.success && response.data) {
      const userList = getOptionsFromUserList(response.data)
      setOptions(userList)
    } else {
      setOptions([])
    }
  }

  const handleQuerySearch = useDebouncedCallback(async (query?: string) => {
    setContactFilter((pre) => ({ ...pre, query }))
  }, 600)

  useEffect(() => {
    if (authUser?.unique_id) {
      if (isSpacePage && currentSpace) {
        setContactFilter({
          space_id: currentSpace.id,
          limit: 10
        })
      } else {
        setContactFilter({ user_id: authUser?.unique_id, limit: 10 })
      }
    }
  }, [authUser?.unique_id, currentSpace, isSpacePage])

  useEffect(() => {
    if (contactFilter) {
      getUserList(contactFilter)
    }
  }, [contactFilter, currentChat])

  useEffect(() => {
    if (isManageMode) {
      setIsGroupChat(true)
      setGroupName(currentChat?.name || "")
    } else if (selectedContacts.length > 1) {
      setIsGroupChat(true)
    } else {
      setIsGroupChat(false)
    }
  }, [selectedContacts, isManageMode, currentChat])

  const currentMembers = isManageMode ? currentChat?.users || [] : []
  const canRemoveMembers = (currentChat?.users?.length || 0) > 2

  const handleRemoveExistingMember = async (userId: string) => {
    if (!currentChat?.id) return

    try {
      const result = await removeUserFromGroup(currentChat.id, userId)
      if (result?.success) {
        toast({
          title: "Success",
          description: "Member removed",
          duration: 3000
        })
        if (contactFilter) await getUserList(contactFilter)
        onSuccess?.()
      } else {
        throw new Error(result?.error || "Failed to remove member")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member",
        duration: 3000
      })
    }
  }

  const handleCreateNewChat = async () => {
    if (!authUser) return
    setIsCreatingChat(true)
    setGroupNameError("")

    const spaceId = currentSpace && isSpacePage ? currentSpace.id : undefined
    const userIds = selectedContacts.map((contact) => contact.value)

    try {
      if (isManageMode && currentChat) {
        if (selectedContacts.length === 0) {
          toast({
            variant: "destructive",
            title: "No users selected",
            duration: 3000
          })
          setIsCreatingChat(false)
          return
        }

        for (const userId of userIds) {
          const result = await addUserToGroup(currentChat.id, userId)
          if (!result?.success) throw new Error(`Failed to add user`)
        }

        toast({
          title: "Success",
          description: `Added members`,
          duration: 3000
        })
        setSelectedContacts([])
        if (contactFilter) await getUserList(contactFilter)
        onSuccess?.()
      } else if (isGroupChat) {
        // Create Group Logic
        const response = await CreateGroupChatAction(
          [...userIds, authUser?.unique_id],
          groupName,
          spaceId
        )
        if (response.success && response.data) {
          setMyChats((pre) => [...pre, response.data])
          switchChat(response.data)
          setIsMobileMenuOpen(false)
          resetAndClose()
        } else {
          setGroupNameError("Error")
        }
      } else {
        // Create Private Logic
        const response = await CreatePrivateChatAction(
          authUser?.unique_id,
          userIds[0],
          spaceId
        )
        if (response.success && response.data) {
          setMyChats((pre) => [...pre, response.data])
          switchChat(response.data)
          setIsMobileMenuOpen(false)
          resetAndClose()
        }
      }
    } catch (e) {
      setGroupNameError("An unexpected error occurred.")
    } finally {
      setIsCreatingChat(false)
    }
  }

  const resetAndClose = () => {
    setSelectedContacts([])
    setGroupName("")
    setIsGroupChat(false)
    setDialogOpen(false)
    setGroupNameError("")
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="ghost"
        size={isManageMode ? "icon" : "sm"}
      >
        {isManageMode ? (
          <Users className="h-5 w-5" />
        ) : (
          <PlusCircle className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {isManageMode ? `Manage - ${currentChat?.name}` : "Start Chat"}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-[425px] space-y-4">
            {isManageMode && currentMembers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Current Members ({currentMembers.length})
                </Label>
                <ScrollArea className="h-32 border rounded-md p-2">
                  {currentMembers.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md mb-1"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.profile_url || ""} />
                          <AvatarFallback>
                            {member.user?.first_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.user?.first_name} {member.user?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>
                      {/* Only show remove if user hasPermission AND it's not themselves AND group size > 2 */}
                      {hasPermission &&
                        canRemoveMembers &&
                        authUser?.unique_id !== member.user?.unique_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() =>
                              handleRemoveExistingMember(member.user_id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {/* Only show Add section if user hasPermission */}
            {(!isManageMode || hasPermission) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {isManageMode ? "Add Members" : "Select Contacts"}
                </Label>
                <MultiSelect
                  className="w-full"
                  onQueryChange={async (query) =>
                    await handleQuerySearch(query)
                  }
                  options={options}
                  selected={selectedContacts}
                  onChange={(value) => setSelectedContacts(value)}
                  placeholder="Search users..."
                  loading={loading}
                />
              </div>
            )}

            {!isManageMode && isGroupChat && (
              <Input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            {(!isManageMode || hasPermission) && (
              <Button
                onClick={handleCreateNewChat}
                disabled={selectedContacts.length === 0 || isCreatingChat}
                loading={isCreatingChat}
              >
                {isManageMode ? "Add Members" : "Start Chat"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateNewChat
