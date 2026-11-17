import {
  ExternalLink,
  Globe,
  GraduationCap,
  Hash,
  LucideIcon
} from "lucide-react"
import Link from "next/link"
import React from "react"
import { ModerationPost } from "./types"

type LocationKind = "feed" | "mentorship" | "channel"

interface PostLocationInfo {
  kind: LocationKind
  label: string
  spaceName?: string
  channelName?: string
  href?: string
}

const KIND_STYLES: Record<
  LocationKind,
  { icon: LucideIcon; className: string }
> = {
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

// A post with no space is on the main feed; a space with no channel is a mentorship space
export const getPostLocation = (post: ModerationPost): PostLocationInfo => {
  const space = post.space
  if (!space) return { kind: "feed", label: "Post Feed" }

  if (!space.channel_id) {
    return {
      kind: "mentorship",
      label: "Mentorship Feed",
      spaceName: space.space_name,
      href: `/mentorship/spaces/${space.space_slug}`
    }
  }

  return {
    kind: "channel",
    label: "Space Feed",
    spaceName: space.space_name,
    channelName: space.channel?.channel_name,
    href: space.channel
      ? `/channels/${space.channel.channel_slug}/spaces/${space.space_slug}`
      : undefined
  }
}

interface PostLocationProps {
  post: ModerationPost
  // "inline" sits next to the post type in the list, "detailed" is the review modal box
  variant?: "inline" | "detailed"
}

function PostLocation({ post, variant = "inline" }: PostLocationProps) {
  const location = getPostLocation(post)
  const { icon: Icon, className } = KIND_STYLES[location.kind]

  if (variant === "inline") {
    const where = [location.spaceName, location.channelName]
      .filter(Boolean)
      .join(" · ")
    return (
      <span
        className="inline-flex min-w-0 max-w-full items-center gap-1.5"
        title={where ? `${location.label}: ${where}` : location.label}
      >
        <span
          className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-1.5 text-[11px] font-medium leading-4 ${className}`}
        >
          <Icon className="h-2.5 w-2.5 shrink-0" />
          {location.label}
        </span>
        {where && (
          <span className="truncate text-xs text-muted-foreground">
            {where}
          </span>
        )}
      </span>
    )
  }

  const badge = (
    <span
      className={`inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {location.label}
    </span>
  )

  return (
    <section className="flex flex-col items-start gap-3 rounded-md border p-4 sm:flex-row sm:justify-between">
      <div className="min-w-0 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Posted in
        </h3>
        {badge}
        {location.spaceName ? (
          <p className="text-sm">
            <span className="font-medium">{location.spaceName}</span>
            {location.channelName && (
              <span className="text-muted-foreground">
                {" "}
                · channel {location.channelName}
              </span>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Visible to everyone on the main feed once approved.
          </p>
        )}
      </div>
      {location.href && (
        <Link
          href={location.href}
          target="_blank"
          className="inline-flex shrink-0 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          Open space
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
    </section>
  )
}

export default PostLocation
