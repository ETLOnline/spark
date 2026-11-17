"use client"

import React, { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { PostStatus } from "@/src/types/Post/PostStatus"
import { Button } from "@/src/components/ui/button"
import { Settings } from "lucide-react"
import PostModerationList from "./PostModerationList"
import PostModerationSettingsModal from "./PostModerationSettingsModal"

// Posts held by the AI check. Approved posts are published and leave this page.
function PostModeration() {
  const [pendingCount, setPendingCount] = useState<number>()
  const [openSettings, setOpenSettings] = useState(false)

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">Post Moderation</h1>
          <Button variant="outline" onClick={() => setOpenSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
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

      <PostModerationSettingsModal
        open={openSettings}
        onOpenChange={setOpenSettings}
      />
    </>
  )
}

export default PostModeration
