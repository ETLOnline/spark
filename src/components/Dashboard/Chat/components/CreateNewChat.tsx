"use client"
import React, { useEffect, useState } from "react"
import { PlusCircle } from "lucide-react"
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
import { FindUserWildCardAction } from "@/src/server-actions/User/FindUserWildCardAction"
import {
  CreateGroupChatAction,
  CreatePrivateChatAction,
  GetChatContactsAction
} from "@/src/server-actions/Chat/Chat"
import { useParams } from "next/navigation"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useDebounce, useDebouncedCallback } from "use-debounce"
import { SelectUser } from "@/src/db/schema"
import { spaceStore } from "@/src/store/space/spaceStore"
import { ChatContactFilters } from "@/src/db/data-access/chat/query"
import { Input } from "@/src/components/ui/input"
import Avvvatars from "avvvatars-react"
import Image from "next/image"
import { chatStore } from "@/src/store/chat/chatStore"
import { toast } from "@/src/hooks/use-toast"

const CreateNewChat = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<MultiSelectOption[]>(
    []
  )
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const setMyChats = useSetAtom(chatStore.myChats)
  const switchChat = useSetAtom(chatStore.switchedChat)
  const [loading, state, error, FindUsers] = useServerAction(
    GetChatContactsAction
  )
  const [isGroupChat, setIsGroupChat] = useState(false)
  const [groupName, setGroupName] = useState<string>("")
  const [groupNameError, setGroupNameError] = useState<string>("")
  const [options, setOptions] = useState<MultiSelectOption[]>([])
  const { space_slug, channel_slug } = useParams()
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const [contactFilter, setContactFilter] = useState<ChatContactFilters>()

  const isSpacePage = space_slug ? true : false

  const getOptionsFromUserList = (users: SelectUser[]) => {
    return users
      .filter((user) => user.unique_id !== authUser?.unique_id)
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
  }, [authUser?.unique_id, currentSpace])

  useEffect(() => {
    if (contactFilter) {
      getUserList(contactFilter)
    }
  }, [contactFilter])

  useEffect(() => {
    if (selectedContacts.length > 1) {
      setIsGroupChat(true)
    } else {
      setIsGroupChat(false)
    }
  }, [selectedContacts])

  const handleCreateNewChat = async () => {
    if (!authUser) return
    setIsCreatingChat(true)
    setGroupNameError("")

    const spaceId = currentSpace && isSpacePage ? currentSpace.id : undefined
    const userIds = selectedContacts.map((contact) => contact.value)
    try {
      if (isGroupChat) {
        // Create Group Chat
        if (groupName.trim() === "") {
          setGroupNameError("Group name is required.")
          setIsCreatingChat(false)
          return
        } else if (groupName.trim().length > 50) {
          setGroupNameError("Group name must be 50 characters or less.")
          setIsCreatingChat(false)
          return
        }
        const response = await CreateGroupChatAction(
          [...userIds, authUser?.unique_id],
          groupName,
          spaceId
        )

        if (response.success === false && response.error) {
          setGroupNameError(response.error)
          setIsCreatingChat(false)
          return
        }
        if (response.success && response.data) {
          const newChat = response.data
          setMyChats((pre) => [...pre, newChat])
          switchChat(newChat)
          setGroupName("")
        }
      } else {
        // Create Direct Chat
        const response = await CreatePrivateChatAction(
          authUser?.unique_id,
          userIds[0],
          spaceId
        )
        if (response.success && response.data) {
          const newChat = response.data
          setMyChats((pre) => [...pre, newChat])
          switchChat(newChat)
        }
        if (response.success == false && response.existingChat) {
          switchChat(response.data)
          toast({
            title: "Chat already exists",
            variant: "destructive",
            duration: 3000
          })
        }
        if (response.success == false && response.error) {
          toast({
            title: response.error,
            variant: "destructive",
            duration: 3000
          })
        }
      }

      setSelectedContacts([])
      setGroupName("")
      setIsGroupChat(false)
      setDialogOpen(false)
    } catch (e) {
      console.error("Uncaught error during chat creation:", e)
      setGroupNameError("An unexpected error occurred.")
    } finally {
      setIsCreatingChat(false)
    }
  }

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} variant="ghost" size="sm">
        <PlusCircle className="h-4 w-4" />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogTitle>Start Chat</DialogTitle>

          <div className="min-h-[425px]">
            <MultiSelect
              className="w-full"
              onQueryChange={async (query) => await handleQuerySearch(query)}
              options={options}
              selected={selectedContacts}
              onChange={(value) => {
                setSelectedContacts(value)
              }}
              placeholder="Select Contacts"
              loading={loading}
            />

            {isGroupChat ? (
              <>
                <Input
                  className="w-full mt-4"
                  placeholder="Type Group Name"
                  onChange={(e) => setGroupName(e.target.value)}
                />
                {groupNameError && (
                  <p className="text-sm text-red-500 mt-1">{groupNameError}</p>
                )}
                <div className="flex items-center justify-center mt-6">
                  <Avvvatars value={groupName} style="shape" size={100} />
                </div>
              </>
            ) : null}

            {selectedContacts.length < 2 ? (
              <div className="flex items-center justify-center mt-6">
                <Image
                  src={"/images/story/chat-story.svg"}
                  alt="chat"
                  width={300}
                  height={300}
                />
              </div>
            ) : null}
          </div>

          <Button
            onClick={handleCreateNewChat}
            disabled={selectedContacts.length === 0 || isCreatingChat}
            loading={isCreatingChat}
          >
            Start {isGroupChat ? "Group" : "Direct"} Chat
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateNewChat
