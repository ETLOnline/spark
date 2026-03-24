import { ChartContainer, ChartTooltip } from "@/src/components/ui/chart"
import moment from "moment"
import React, { JSX } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  TooltipProps,
  XAxis,
  YAxis
} from "recharts"
import { calculateChartTicks, calculateYAxisTicks } from "../utils/Helper"

type ChartData = {
  day: string
  value: number | null
  fullDate: string
  benchmark?: number | undefined
}

interface Props {
  chartData: ChartData[]
  allTicks: string[]
  getSprintBurnDownLoading: boolean
  CustomTooltip: (props: TooltipProps<number, string>) => JSX.Element | null
}

const chartConfig = {
  tasks: { label: "Remaining Tasks", color: "green" },
  points: { label: "Story Points", color: "blue" }
}

function BurnDownChart({ chartData, allTicks, CustomTooltip }: Props) {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={chartData} margin={{ left: 20, right: 20 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickFormatter={(v) => moment(v, "YYYY-MM-DD").format("MMM D")}
          ticks={calculateChartTicks(allTicks)}
          interval="preserveStartEnd"
        />

        <YAxis
          domain={[0, "dataMax"]}
          ticks={calculateYAxisTicks(chartData, 2)}
        />

        <ChartTooltip content={CustomTooltip ? <CustomTooltip /> : undefined} />

        <Line
          dataKey="value"
          type="stepAfter"
          stroke="green"
          strokeWidth={2}
          dot={false}
        />

        {/* ✅ Benchmark line */}
        <Line
          dataKey="benchmark"
          type="linear"
          stroke="gray"
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

export default BurnDownChart
