"use client"

import Loader from "@/src/components/common/Loader/Loader"
import { Button } from "@/src/components/ui/button"
import { SelectUser, SelectUserContact } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreatePrivateChatAction,
  GetMutualChatAction
} from "@/src/server-actions/Chat/Chat"
import {
  AcceptConnectionAction,
  CreateContactAction,
  DeleteContactAction,
  GetContactAction
} from "@/src/server-actions/Contact/Contact"
import { userStore } from "@/src/store/user/userStore"
import pusherClient from "@/src/services/realtime/PusherClient" // Imported Pusher
import { useAtomValue } from "jotai"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { ActivityType } from "../../Connections/types/connections.types"
import { UserPlus2 } from "lucide-react"

interface Props {
  user: SelectUser
}

const ProfileFollowActions = ({ user }: Props) => {
  const { toast } = useToast()
  const [contactLoading, contact, getContacterror, getContact] =
    useServerAction(GetContactAction)
  const [connectLoading, follow, connectError, createContact] =
    useServerAction(CreateContactAction)
  const [mutualChatLoading, mutualChat, mutualChaterror, getMutualChat] =
    useServerAction(GetMutualChatAction)
  const [createChatLoading, newChatState, createChaterror, createChat] =
    useServerAction(CreatePrivateChatAction)
  const [
    acceptConnectionLoading,
    acceptConnectionState,
    acceptConnectionError,
    acceptConnection
  ] = useServerAction(AcceptConnectionAction)
  const [
    deleteContactLoading,
    deleteContactState,
    deleteContactError,
    deleteContact
  ] = useServerAction(DeleteContactAction)

  const [connectionContact, setConnectionContact] =
    useState<SelectUserContact>()

  const router = useRouter()
  const authUser = useAtomValue(userStore.AuthUser)

  useEffect(() => {
    if (contact && contact.data) {
      setConnectionContact(contact.data)
    }
  }, [contact])

  useEffect(() => {
    if (authUser && authUser?.unique_id && user && user.unique_id) {
      getContact(authUser.unique_id, user.unique_id)
      getMutualChat(user.unique_id, "open")
      const channel = pusherClient.subscribe(authUser.unique_id)

      const handleIncomingUpdate = (request: any) => {
        if (
          request.user_id === user.unique_id ||
          request.contact_id === user.unique_id
        ) {
          setConnectionContact({ ...request })
        }
      }

      const handleIncomingDeletion = (request: any) => {
        if (
          request.user_id === user.unique_id ||
          request.contact_id === user.unique_id
        ) {
          setConnectionContact(undefined)
        }
      }

      channel.bind(ActivityType.request, handleIncomingUpdate)
      channel.bind(ActivityType.acceptRequest, handleIncomingUpdate)
      channel.bind(ActivityType.delRequest, handleIncomingDeletion)

      return () => {
        channel.unbind_all()
        pusherClient.unsubscribe(authUser.unique_id)
      }
    }
  }, [authUser?.unique_id, user.unique_id])

  const handleConnect = async () => {
    if (!authUser?.unique_id || !user.unique_id) return
    try {
      const res = await createContact(user.unique_id)
      if (res?.success && res?.data) {
        setConnectionContact({ ...res.data })
        toast({
          title: "Connection Request Sent!",
          duration: 3000
        })
      } else {
        toast({
          variant: "destructive",
          title: "Unable to Connect!",
          description:
            "There was an issue performing the action please try again.",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to Connect!",
        description:
          "There was an issue performing the action please try again.",
        duration: 3000
      })
      console.error("Error creating contact", error)
    }
  }

  /**
   * Initiates a chat with the specified user. If a mutual chat already exists, it navigates to the chat using the existing chat slug.
   * Otherwise, it creates a new chat and navigates to it.
   * Requires both the current user's unique ID and the target user's unique ID to be available.
   */
  const handleMessage = async () => {
    if (!authUser?.unique_id || !user.unique_id) return
    let chatSlug = null
    if (mutualChat && mutualChat.success && mutualChat.data) {
      chatSlug = mutualChat.data?.chat_slug
    } else {
      const newChat = await createChat(authUser?.unique_id, user.unique_id)
      chatSlug = newChat?.data?.chat_slug
    }
    router.push(`/chat?active_chat=${chatSlug}`)
  }

  const handleAcceptConnection = async () => {
    if (!connectionContact?.user_id || !connectionContact?.contact_id) return
    try {
      const res = await acceptConnection(
        connectionContact?.user_id,
        connectionContact?.contact_id
      )
      if (res?.success && res?.data) {
        setConnectionContact({ ...res.data })
        toast({
          title: "Connection Accepted",
          description: "You have successfully accepted the connection request",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to Accept Request!",
        description:
          "There was an issue performing the action please try again.",
        duration: 3000
      })
      console.error("Error accepting connection", error)
    }
  }

  const handledeleteContact = async () => {
    if (!connectionContact?.user_id || !connectionContact?.contact_id) return
    try {
      const res = await deleteContact(
        connectionContact?.user_id,
        connectionContact?.contact_id
      )
      if (res?.success) {
        setConnectionContact(undefined)
        toast({
          title: "Disconnected!",
          description: "You have successfully disconnected with the user",
          duration: 3000
        })
      }
    } catch (error) {}
  }

  return (
    <div className="flex gap-2">
      {connectionContact && connectionContact.is_accepted ? (
        <>
          <Button
            variant="outline"
            onClick={handledeleteContact}
            loading={deleteContactLoading}
            size={"sm"}
          >
            Disconnect
          </Button>
          <Button
            loading={createChatLoading || mutualChatLoading}
            onClick={handleMessage}
            size={"sm"}
          >
            Message
          </Button>
        </>
      ) : null}
      {connectionContact &&
      connectionContact.is_requested &&
      !connectionContact.is_accepted ? (
        <>
          {connectionContact.contact_id === authUser?.unique_id ? (
            <Button
              onClick={handleAcceptConnection}
              loading={acceptConnectionLoading}
              size={"sm"}
            >
              Accept Connection
            </Button>
          ) : (
            <Button
              disabled
              className="bg-muted disabled:opacity-100"
              size={"sm"}
            >
              {contactLoading ? <Loader /> : null} Connect Requested
            </Button>
          )}
        </>
      ) : null}
      {!connectionContact ||
      (!connectionContact.is_requested && !connectionContact.is_accepted) ? (
        <Button
          onClick={handleConnect}
          disabled={contactLoading || connectLoading}
          size={"sm"}
        >
          {contactLoading || connectLoading ? <Loader /> : null}
          <UserPlus2 className="h-4 w-4" />
          Connect
        </Button>
      ) : null}
    </div>
  )
}

export default ProfileFollowActions
