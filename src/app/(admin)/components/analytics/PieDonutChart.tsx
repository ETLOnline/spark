"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/src/components/ui/chart"
import { cn } from "@/src/lib/utils"

export interface PieDonutSegment {
  label: string
  count: number
  /** Share shown in the tooltip, e.g. "29.7%" */
  share: string
  /** Tailwind bg-* class for the tooltip dot */
  bg: string
  /** Tailwind text-* class — the slice is filled with currentColor */
  text: string
}

interface PieDonutChartProps {
  segments: PieDonutSegment[]
  /** Big number in the centre */
  centerValue: number
  /** Caption under the centre number */
  centerLabel: string
  className?: string
}

/** shadcn "Pie Chart – Donut with Text": a donut with a centred total and a hover tooltip per slice. */
export function PieDonutChart({
  segments,
  centerValue,
  centerLabel,
  className
}: PieDonutChartProps) {
  // CSS-safe keys for ChartContainer; the readable name lives in `label`
  const data = segments.map((s, i) => ({ ...s, key: `segment-${i}` }))
  const chartConfig = Object.fromEntries(
    data.map((d) => [d.key, { label: d.label }])
  ) satisfies ChartConfig

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-square h-36 w-36 flex-shrink-0", className)}
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              nameKey="key"
              formatter={(value, _name, item) => {
                const d = item.payload as (typeof data)[number]
                return (
                  <div className="flex w-full items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${d.bg}`}
                    />
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap pl-2 font-mono font-medium tabular-nums text-foreground">
                      {Number(value).toLocaleString()}
                      <span className="text-muted-foreground">{d.share}</span>
                    </span>
                  </div>
                )
              }}
            />
          }
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="key"
          innerRadius="58%"
          strokeWidth={2}
        >
          {data.map((d) => (
            <Cell
              key={d.key}
              fill="currentColor"
              className={`${d.text} stroke-background`}
            />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-lg font-bold"
                    >
                      {centerValue.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 16}
                      className="fill-muted-foreground text-[10px]"
                    >
                      {centerLabel}
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
