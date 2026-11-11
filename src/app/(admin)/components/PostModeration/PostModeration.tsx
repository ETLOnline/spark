"use client"

import React, { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { PostStatus } from "@/src/types/Post/PostStatus"
import PostModerationList from "./PostModerationList"

// Posts held by the AI check. Approved posts are published and leave this page.
function PostModeration() {
  const [pendingCount, setPendingCount] = useState<number>()

  return (
    <>
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold">Post Moderation</h1>
        </div>
        <p className="mb-6 text-muted-foreground">
          Posts held by the AI check wait here until you review them. Approve a
          post to publish it, or reject it to hide it from everyone.
        </p>
      </div>

      <Tabs defaultValue="pending-posts">
        <TabsList>
          <TabsTrigger value="pending-posts">
            Pending{pendingCount !== undefined ? ` (${pendingCount})` : ""}
          </TabsTrigger>
          <TabsTrigger value="rejected-posts">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending-posts">
          <PostModerationList
            status={PostStatus.PENDING_REVIEW}
            onTotalChange={setPendingCount}
          />
        </TabsContent>
        <TabsContent value="rejected-posts">
          <PostModerationList status={PostStatus.REJECTED} />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default PostModeration
