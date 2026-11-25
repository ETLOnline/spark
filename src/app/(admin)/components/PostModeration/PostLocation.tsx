import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import React from "react"
import { KIND_STYLES } from "./constants"
import { LocationKind, ModerationPost } from "./types"

interface PostLocationInfo {
  kind: LocationKind
  label: string
  spaceName?: string
  channelName?: string
  href?: string
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
      <div
        className="inline-flex min-w-0 max-w-full items-center gap-1.5"
        title={where ? `${location.label}: ${where}` : location.label}
      >
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 gap-1 whitespace-nowrap rounded-full px-1.5 py-0 text-[11px] font-medium leading-4",
            className
          )}
        >
          <Icon className="h-2.5 w-2.5 shrink-0" />
          {location.label}
        </Badge>
        {where && (
          <span className="truncate text-xs text-muted-foreground">
            {where}
          </span>
        )}
      </div>
    )
  }

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "w-fit gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-medium",
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {location.label}
    </Badge>
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
