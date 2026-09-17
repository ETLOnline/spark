"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"

export function RatingInput({
  value,
  onChange
}: {
  value: number
  onChange: (value: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Button
          key={i}
          type="button"
          variant="ghost"
          size="icon"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="p-0.5 h-auto w-auto cursor-pointer"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              (hovered || value) >= i
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-muted-foreground/30"
            )}
            strokeWidth={1.5}
          />
        </Button>
      ))}
    </div>
  )
}
