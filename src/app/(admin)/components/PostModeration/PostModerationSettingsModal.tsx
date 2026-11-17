"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetPostModerationSettingsAction,
  PostModerationSettingKey,
  UpdatePostModerationSettingAction
} from "@/src/server-actions/Post/PostModeration"
import {
  AI_POST_MODERATION_ENABLED,
  PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED
} from "@/src/utils/constants"

interface SettingItem {
  key: PostModerationSettingKey
  title: string
  description: string
  onMessage: string
  offMessage: string
}

const SETTINGS: SettingItem[] = [
  {
    key: AI_POST_MODERATION_ENABLED,
    title: "AI Post Moderation",
    description:
      "When on, posts are checked by AI and only flagged ones are held here for review. When off, the AI check is skipped and every post is held for an admin to review manually.",
    onMessage: "New and edited posts will be checked by AI.",
    offMessage: "Every new and edited post will be held for manual review."
  },
  {
    key: PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED,
    title: "Private Community AI Moderation",
    description:
      "When on, posts in private communities are checked by AI and only flagged ones are held for review. When off, the AI check is skipped and every private community post is held for an admin to review manually.",
    onMessage: "Posts in private communities will be checked by AI.",
    offMessage:
      "Every post in a private community will be held for manual review."
  }
]

// Settings that only take effect while AI Post Moderation is on
const DEPENDS_ON_MAIN_FLAG: PostModerationSettingKey[] = [
  PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED
]

interface PostModerationSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Lets super admins switch the post moderation feature flags on or off
function PostModerationSettingsModal({
  open,
  onOpenChange
}: PostModerationSettingsModalProps) {
  const { toast } = useToast()
  const [values, setValues] =
    useState<Record<PostModerationSettingKey, boolean>>()
  const [savingKey, setSavingKey] = useState<PostModerationSettingKey>()
  const [getLoading, , , getSettings] = useServerAction(
    GetPostModerationSettingsAction
  )
  const [, , , updateSetting] = useServerAction(
    UpdatePostModerationSettingAction
  )

  useEffect(() => {
    if (!open) return
    getSettings().then((res) => {
      if (res?.success && res.data) {
        setValues(res.data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res?.error || "Failed to load post moderation settings"
        })
      }
    })
  }, [open])

  const handleToggle = async (setting: SettingItem, checked: boolean) => {
    setSavingKey(setting.key)
    const res = await updateSetting(setting.key, checked)
    setSavingKey(undefined)
    if (res?.success && res.data) {
      const isEnabled = res.data.is_enabled
      setValues((prev) => prev && { ...prev, [setting.key]: isEnabled })
      toast({
        title: `${setting.title} turned ${isEnabled ? "on" : "off"}`,
        description: isEnabled ? setting.onMessage : setting.offMessage
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: res?.error || "Failed to update post moderation setting"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post Moderation Settings</DialogTitle>
          <DialogDescription>
            Control how new and edited posts are reviewed before they are
            published.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {SETTINGS.map((setting) => {
            // with the main flag off nothing is checked by AI, so dependent settings are locked
            const locked =
              DEPENDS_ON_MAIN_FLAG.includes(setting.key) &&
              values?.[AI_POST_MODERATION_ENABLED] === false
            return (
              <div
                key={setting.key}
                className={`flex items-start justify-between gap-4 rounded-md border p-4 ${
                  locked ? "opacity-60" : ""
                }`}
              >
                <div className="space-y-1">
                  <Label htmlFor={setting.key} className="text-base">
                    {setting.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                  {locked && (
                    <p className="text-xs text-muted-foreground">
                      AI Post Moderation is off, so every post, including
                      private community posts, is held for manual review.
                    </p>
                  )}
                </div>
                {getLoading || !values ? (
                  <Loader size={LoaderSizes.sm} />
                ) : (
                  <Switch
                    id={setting.key}
                    checked={values[setting.key] && !locked}
                    disabled={savingKey !== undefined || locked}
                    onCheckedChange={(checked) =>
                      handleToggle(setting, checked)
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PostModerationSettingsModal
