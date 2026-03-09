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
          <TabsTrigger value="approved-requests">Approved Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="pending-requests">
          <CommunityRequestList status={RequestStatus.PENDING} />
        </TabsContent>
        <TabsContent value="rejected-requests">
          <CommunityRequestList status={RequestStatus.REJECTED} />
        </TabsContent>
        <TabsContent value="approved-requests">
          <CommunityRequestList status={RequestStatus.ACCEPTED} />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default CommunityRequests
