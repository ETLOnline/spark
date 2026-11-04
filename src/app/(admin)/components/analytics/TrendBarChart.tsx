"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/src/components/ui/chart"
import { cn } from "@/src/lib/utils"

export interface TrendPoint {
  date: string
  count: number
}

interface TrendBarChartProps {
  data: TrendPoint[]
  formatLabel: (date: string) => string
  className?: string
}

const chartConfig = {
  count: {
    label: "New users",
    color: "hsl(var(--primary))"
  }
} satisfies ChartConfig

/** shadcn "Bar Chart – Label": one bar per period with its count above it and a hover tooltip. */
export function TrendBarChart({
  data,
  formatLabel,
  className
}: TrendBarChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto h-40 sm:h-48 w-full", className)}
    >
      <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={8}
          tickFormatter={formatLabel}
          className="text-[10px]"
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(date) => formatLabel(String(date))}
            />
          }
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={4}>
          <LabelList
            position="top"
            offset={6}
            className="fill-foreground"
            fontSize={10}
            formatter={(value: number) => value.toLocaleString()}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
