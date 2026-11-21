"use client"

import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"

/** Table cells shared by the community analytics table and the admin communities list. */

export const VISIBILITY_LABEL = {
  public: "Public",
  private: "Private"
} as const

/** Shown when a field is missing — e.g. a snapshot built before these columns existed. */
export function EmptyCell() {
  return <span className="text-muted-foreground">—</span>
}

/**
 * First admin (the creator, when they still hold the role — the backend
 * orders it that way) plus a "+N" badge whose tooltip lists every admin.
 */
export function AdminNames({ names }: { names?: string[] }) {
  if (!names || names.length === 0) return <EmptyCell />

  const [first, ...rest] = names
  if (rest.length === 0) return <span>{first}</span>

  return (
    <div className="flex items-center gap-1.5">
      <span>{first}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label={`Show all ${names.length} admins`}
              className="h-auto p-0 rounded-full hover:bg-transparent focus-visible:ring-2"
            >
              <Badge
                variant="outline"
                className="border-transparent bg-muted text-muted-foreground font-medium px-1.5 cursor-default"
              >
                +{rest.length}
              </Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            <p className="text-xs font-semibold mb-1">
              {names.length} community admins
            </p>
            <ul className="text-xs space-y-0.5">
              {names.map((name, i) => (
                <li key={`${name}-${i}`}>{name}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export function VisibilityBadge({
  visibility
}: {
  visibility?: "public" | "private"
}) {
  if (!visibility) return <EmptyCell />
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        visibility === "public"
          ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
          : "bg-muted text-muted-foreground"
      )}
    >
      {VISIBILITY_LABEL[visibility]}
    </Badge>
  )
}

export function FypBadge({ enabled }: { enabled?: boolean }) {
  if (enabled === undefined) return <EmptyCell />
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        enabled
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      )}
    >
      {enabled ? "Yes" : "No"}
    </Badge>
  )
}
