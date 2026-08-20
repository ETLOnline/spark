import { BadgeCheck } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { cn } from "@/src/lib/utils"

interface VerifiedBadgeProps {
  className?: string
  size?: number
}

export function VerifiedBadge({ className, size = 16 }: VerifiedBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck
            size={size}
            className={cn("shrink-0 fill-blue-500 text-white", className)}
            aria-label="Verified"
          />
        </TooltipTrigger>
        <TooltipContent>Verified</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
