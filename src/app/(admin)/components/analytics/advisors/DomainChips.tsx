"use client"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"

/** Two short domains fit side by side in the column; longer names show one. */
const MAX_CHARS_FOR_TWO = 28

const CHIP_CLASS = "font-normal max-w-[11rem] truncate"

/** Shows the first one or two domains as chips and the rest as "+n" with a tooltip. */
export function DomainChips({ domains }: { domains: string[] }) {
  if (domains.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const visibleCount =
    domains.length >= 2 &&
    domains[0].length + domains[1].length <= MAX_CHARS_FOR_TWO
      ? 2
      : 1
  const visible = domains.slice(0, visibleCount)
  const hidden = domains.slice(visibleCount)

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((d) => (
        <Badge key={d} variant="outline" className={CHIP_CLASS} title={d}>
          {d}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                aria-label={`${hidden.length} more domains: ${hidden.join(", ")}`}
                className="h-auto rounded-md border bg-muted/60 px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                +{hidden.length}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">
              {hidden.join(", ")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
