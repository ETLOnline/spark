'use client'

import Loader from '@/src/components/common/Loader/Loader'
import { Button } from '@/src/components/ui/button'
import { SelectUser } from '@/src/db/schema'
import { useToast } from '@/src/hooks/use-toast'
import {useServerAction}  from '@/src/hooks/useServerAction'
import { CreatePrivateChatAction, GetMutualChatAction } from '@/src/server-actions/Chat/Chat'
import { AcceptConnectionAction, CreateContactAction, GetContactAction } from '@/src/server-actions/Contact/Contact'
import { userStore } from '@/src/store/user/userStore'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

interface Props {
  user : SelectUser
}

const ProfileFollowActions = ({user}:Props) => {
  const {toast} = useToast()
  const [contactLoading, contact, getContacterror, getContact] = useServerAction(GetContactAction)
  const [connectLoading, follow, connectError, createContact] = useServerAction(CreateContactAction)
  const [mutualChatLoading, mutualChat, mutualChaterror, getMutualChat] = useServerAction(GetMutualChatAction)
  const [createChatLoading, newChatState, createChaterror, createChat] = useServerAction(CreatePrivateChatAction)
  const [acceptConnectionLoading, acceptConnectionState, acceptConnectionError, acceptConnection] = useServerAction(AcceptConnectionAction)
  
  const router = useRouter()
  const Iam = useAtomValue(userStore.AuthUser)

  useEffect(()=>{
    if(Iam?.unique_id && user.unique_id){
      getContact(Iam.unique_id, user.unique_id)
      getMutualChat(user.unique_id)
    }
  },[Iam?.unique_id, user.unique_id])

  /**
   * Connects the current user to the specified user. If a contact already exists, it does nothing.
   * Otherwise, it creates a new contact and updates the server state.
   * @requires both the current user's unique ID and the target user's unique ID to be available.
   */
  const handleConnect = async() => {
    if(!Iam?.unique_id || !user.unique_id) return
    await createContact(Iam?.unique_id, user.unique_id)
    await getContact(Iam?.unique_id, user.unique_id)
  }

  /**
   * Initiates a chat with the specified user. If a mutual chat already exists, it navigates to the chat using the existing chat slug.
   * Otherwise, it creates a new chat and navigates to it.
   * Requires both the current user's unique ID and the target user's unique ID to be available.
   */
  const handleMessage = async() => {
    if(!Iam?.unique_id || !user.unique_id) return
    let chatSlug = null
    if(mutualChat && mutualChat.success && mutualChat.data){
      chatSlug = mutualChat.data?.chat_slug
    }else{
      const newChat = await createChat(Iam?.unique_id, user.unique_id)
      chatSlug = newChat?.data?.chat_slug
    }
    router.push(`/chat?active_chat=${chatSlug}`)
  }

  const handleAcceptConnection = async() => {
    if(!Iam?.unique_id || !user.unique_id) return
    await acceptConnection(Iam?.unique_id, user.unique_id)
    await getContact(Iam?.unique_id, user.unique_id)
    toast({
      title: 'Connection Accepted',
      description: 'You have successfully accepted the connection request',
      duration: 3000,
    })
  }
  
  return (
    <div className="flex gap-2">
        <Button>Follow</Button>
        {
          contact?.data && contact.data.is_accepted ? (
            <Button loading={createChatLoading || mutualChatLoading} onClick={handleMessage} >
              Message
            </Button>
          ):null
        }
        {
          contact?.data && contact.data.is_requested && !contact.data.is_accepted ? (
            <>
              {
                contact.data.contact_id === Iam?.unique_id ? (
                  <Button onClick={handleAcceptConnection}>Accept Connection</Button>
                ):(
                  <Button disabled={acceptConnectionLoading}>{contactLoading || acceptConnectionLoading ? <Loader /> : null} Connect Requested</Button>
                )
              }
            </>
          ):null
        }
        {
          !contact?.data || (!contact.data.is_requested && !contact.data.is_accepted )  ? (
            <Button onClick={handleConnect} disabled={contactLoading || connectLoading}> 
              {(contactLoading||connectLoading) ? <Loader /> : null} Connect
            </Button>
          ) : null
        }
    </div>
  )
}

export default ProfileFollowActions