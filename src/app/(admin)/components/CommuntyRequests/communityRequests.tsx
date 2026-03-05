"use client"

import { SelectCommunityRequest } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { getCommunityRequestsAction } from "@/src/server-actions/Community/CommunityRequests/CommunityRequests"
import React, { useEffect, useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import CommunityRequestList from "./CommunityRequestList"
import { RequestStatus } from "@/src/types/CommunityCreationRequest/CommunityCreationRequest"
import { useAtom } from "jotai"
import { communityRequestsStore } from "@/src/store/community/commmunityRequest/communityRequestStore"

function CommunityRequests() {
  const [getCommunityRequestsLoading, , , getCommunityRequests] =
    useServerAction(getCommunityRequestsAction)
  const [communityRequests, setCommunityRequests] = useAtom(
    communityRequestsStore.CommunityRequests
  )
  const [pendingRequests, setPendingRequests] = useState<
    SelectCommunityRequest[]
  >([])
  const [approvedRequests, setApprovedRequests] = useState<
    SelectCommunityRequest[]
  >([])
  const [rejectedRequests, setRejectedRequests] = useState<
    SelectCommunityRequest[]
  >([])

  const fetchData = async () => {
    const res = await getCommunityRequests()

    if (res?.success && res?.data) {
      setCommunityRequests(res.data.communityRequests)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (communityRequests) {
      setPendingRequests(
        communityRequests.filter(
          (request) => request.status === RequestStatus.PENDING
        )
      )
      setApprovedRequests(
        communityRequests.filter(
          (request) => request.status === RequestStatus.ACCEPTED
        )
      )
      setRejectedRequests(
        communityRequests.filter(
          (request) => request.status === RequestStatus.REJECTED
        )
      )
    }
  }, [communityRequests])

  return (
    <>
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold">Community Creation Requests</h1>
        </div>
        <p className="mb-6 text-muted-foreground">
          Review and manage community creation requests submitted by users.
          Approve or reject requests to ensure quality, relevance, and
          compliance with platform guidelines.
        </p>
      </div>

      <Tabs defaultValue="pending-requests">
        <TabsList>
          <TabsTrigger value="pending-requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="rejected-requests">Rejected Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="pending-requests">
          <CommunityRequestList
            communityRequests={pendingRequests}
            getCommunityRequestsLoading={getCommunityRequestsLoading}
            FetchRequests={fetchData}
          />
        </TabsContent>
        <TabsContent value="rejected-requests">
          <CommunityRequestList
            communityRequests={rejectedRequests}
            getCommunityRequestsLoading={getCommunityRequestsLoading}
            FetchRequests={fetchData}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default CommunityRequests
