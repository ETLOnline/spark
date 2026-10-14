"use client"

import { ReactNode } from "react"
import { cn } from "@/src/lib/utils"

export interface DonutSegment {
  key: string
  /** Share of the ring, 0–100 */
  value: number
  /** Tailwind text-* class (stroke uses currentColor) … */
  className?: string
  /** … or an explicit stroke colour */
  color?: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  /** viewBox size (square) */
  size?: number
  radius: number
  strokeWidth: number
  /** Classes for the <svg> (size, rotation) */
  svgClassName?: string
  /** Classes for the wrapper (positioning within the parent) */
  className?: string
  /** Optional background ring, e.g. "text-muted/30" */
  trackClassName?: string
  /** Stroke length per 1% (defaults to circumference / 100) */
  unit?: number
  /** "remainder": gap = circumference − dash; "full": gap = 100 units */
  gap?: "remainder" | "full"
  /** Shift every segment's start by this many percent */
  startOffset?: number
  /** Rotate each segment circle (degrees) about the centre instead of rotating the whole <svg> */
  segmentRotation?: number
  /** Centre label */
  children?: ReactNode
}

/** SVG ring chart built from stroked circles, with an optional centred label. */
export function DonutChart({
  segments,
  size = 80,
  radius,
  strokeWidth,
  svgClassName,
  className,
  trackClassName,
  unit,
  gap = "remainder",
  startOffset = 0,
  segmentRotation,
  children
}: DonutChartProps) {
  const c = size / 2
  const circ = 2 * Math.PI * radius
  const perPct = unit ?? circ / 100
  let cumulative = 0

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${size} ${size}`} className={svgClassName}>
        {trackClassName && (
          <circle
            cx={c}
            cy={c}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={trackClassName}
          />
        )}
        {segments.map((s) => {
          const dash = s.value * perPct
          const offset = startOffset * perPct - cumulative * perPct
          cumulative += s.value
          return (
            <circle
              key={s.key}
              cx={c}
              cy={c}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              stroke={s.color ?? "currentColor"}
              strokeDasharray={`${dash} ${gap === "full" ? 100 * perPct : circ - dash}`}
              strokeDashoffset={offset}
              className={s.className}
              transform={
                segmentRotation !== undefined
                  ? `rotate(${segmentRotation} ${c} ${c})`
                  : undefined
              }
            />
          )
        })}
      </svg>
      {children && (
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </span>
      )}
    </div>
  )
}
