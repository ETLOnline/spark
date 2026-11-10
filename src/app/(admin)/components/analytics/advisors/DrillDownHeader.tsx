"use client"

import { ReactNode } from "react"

interface DrillDownHeaderProps {
  title: ReactNode
  description?: ReactNode
}

/** Title + description at the top of each advisor drill-down page. */
export function DrillDownHeader({ title, description }: DrillDownHeaderProps) {
  return (
    <div className="min-w-0">
      <h1 className="text-xl sm:text-2xl font-semibold [overflow-wrap:anywhere]">
        {title}
      </h1>
      {description && (
        <div className="text-sm text-muted-foreground mt-1">{description}</div>
      )}
    </div>
  )
}
