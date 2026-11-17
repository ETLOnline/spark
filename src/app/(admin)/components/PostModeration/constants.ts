import { Globe, GraduationCap, Hash } from "lucide-react"
import { PostModerationSettingKey } from "@/src/server-actions/Post/PostModeration"
import {
  AI_POST_MODERATION_ENABLED,
  PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED
} from "@/src/utils/constants"
import {
  LocationKind,
  LocationKindStyle,
  PostModerationSettingItem
} from "./types"

// Author | Post (with where it was posted) | AI outcome | Reason | Held | Action
// Text columns shrink to fit (and truncate); badge, time and button columns are fixed so the
// header lines up with every row. No min width, so the table never scrolls sideways.
export const GRID_COLS =
  "grid-cols-[minmax(0,1fr)_minmax(0,2fr)_200px_minmax(0,1.6fr)_110px_130px]"

// Icon and colours of the "Posted in" badge for each kind of location
export const KIND_STYLES: Record<LocationKind, LocationKindStyle> = {
  feed: {
    icon: Globe,
    className:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"
  },
  mentorship: {
    icon: GraduationCap,
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800"
  },
  channel: {
    icon: Hash,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
  }
}

// Switches shown in the Post Moderation settings modal
export const POST_MODERATION_SETTINGS: PostModerationSettingItem[] = [
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
export const DEPENDS_ON_MAIN_FLAG: PostModerationSettingKey[] = [
  PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED
]
