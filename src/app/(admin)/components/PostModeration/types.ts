import {
  GetModerationPostsAction,
  PostModerationSettingKey
} from "@/src/server-actions/Post/PostModeration"
import { LucideIcon } from "lucide-react"

type ModerationPostsResponse = Awaited<
  ReturnType<typeof GetModerationPostsAction>
>

// A held or rejected post as the admin list gets it: author, poll options and files included
export type ModerationPost = NonNullable<
  ModerationPostsResponse["data"]
>["posts"][number]

// Where a post was made: the main feed, a mentorship space, or a space in a channel
export type LocationKind = "feed" | "mentorship" | "channel"

export interface LocationKindStyle {
  icon: LucideIcon
  className: string
}

// One switch in the Post Moderation settings modal
export interface PostModerationSettingItem {
  key: PostModerationSettingKey
  title: string
  description: string
  onMessage: string
  offMessage: string
}
