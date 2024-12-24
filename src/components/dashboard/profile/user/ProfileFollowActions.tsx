'use client'

import Loader from '@/src/components/common/Loader/Loader'
import { Button } from '@/src/components/ui/button'
import { SelectUser } from '@/src/db/schema'
import {useServerAction}  from '@/src/hooks/useServerAction'
import { CreateContactAction, GetContactAction } from '@/src/server-actions/Contact/Contact'
import { userStore } from '@/src/store/user/userStore'
import { useUser } from '@clerk/nextjs'
import { useAtomValue } from 'jotai'
import React, { useEffect } from 'react'

interface Props {
  user : SelectUser
}

const ProfileFollowActions = ({user}:Props) => {
  // const {loading:contactLoading, state:contact, error, execute:getContact} = useServerAction(GetContactAction)
  // const {loading:connectLoading, state:follow, execute:CreateContact} = useServerAction(CreateContactAction)
  const [contactLoading, contact, getContacterror, getContact] = useServerAction(GetContactAction)
  const [connectLoading, follow, connectError, CreateContact] = useServerAction(CreateContactAction)

  const Iam = useAtomValue(userStore.user)

  useEffect(()=>{
    if(Iam?.unique_id && user.unique_id){
      getContact(Iam.unique_id, user.unique_id)
    }
  },[Iam?.unique_id, user.unique_id])

  const handleConnect = async() => {
    if(!Iam?.unique_id || !user.unique_id) return
    console.log(Iam?.unique_id, user.unique_id , "get Contact")
    await CreateContact(Iam?.unique_id, user.unique_id)
    await getContact(Iam?.unique_id, user.unique_id)
  }

  return (
    <div className="flex gap-2">
        <Button>Follow</Button>
        {
          contact?.data && contact.data.is_accepted ? (
            <Button>Message</Button>
          ):null
        }
        {
          contact?.data && contact.data.is_requested && !contact.data.is_accepted ? (
            <Button>Connect Requested</Button>
          ):null
        }
        {
          !contact?.data && (
            <Button onClick={handleConnect} disabled={contactLoading || connectLoading}> 
              {(contactLoading||connectLoading) && <Loader />} Connect
            </Button>
          )
        }
    </div>
  )
}

export default ProfileFollowActions