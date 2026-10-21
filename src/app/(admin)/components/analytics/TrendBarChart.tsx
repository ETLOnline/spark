"use client"

export interface TrendPoint {
  date: string
  count: number
}

interface TrendBarChartProps {
  data: TrendPoint[]
  formatLabel: (date: string) => string
  className?: string
}

/**
 * Flexbox bar chart — heights are plain CSS percentages of the max value in
 * the series, no SVG geometry needed for a shape this simple (unlike
 * DonutChart's arcs). A series of all zeros still renders empty bars rather
 * than divide-by-zero NaN heights.
 */
export function TrendBarChart({
  data,
  formatLabel,
  className
}: TrendBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <div
      className={`flex items-end gap-1 sm:gap-2 h-40 sm:h-48 ${className ?? ""}`}
    >
      {data.map((d) => {
        const heightPct = (d.count / max) * 100
        return (
          <div
            key={d.date}
            className="flex-1 min-w-0 h-full flex flex-col items-center gap-1.5"
          >
            <div className="w-full flex-1 flex flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-medium tabular-nums">
                {d.count.toLocaleString()}
              </span>
              <div
                title={`${formatLabel(d.date)}: ${d.count.toLocaleString()}`}
                className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
                style={{
                  height: `${d.count > 0 ? Math.max(heightPct, 3) : 0}%`
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
              {formatLabel(d.date)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
