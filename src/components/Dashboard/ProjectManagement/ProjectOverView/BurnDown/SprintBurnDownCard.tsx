"use client"

import { TooltipProps } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { BarChart3 } from "lucide-react"
import Loader from "@/src/components/common/Loader/Loader"
import moment from "moment"
import BurnDownChart from "./BurnDownChart"
import useSprintBurnDownHook from "../hooks/useSprintBurnDownHook"

interface Props {
  sprintId: string
  sprintStart: string
  sprintEnd: string
}

export function SprintBurnDownCard({
  sprintId,
  sprintStart,
  sprintEnd
}: Props) {
  const { TaskchartData, PointChartData, allTicks, getSprintBurnDownLoading } =
    useSprintBurnDownHook({ sprintId, sprintStart, sprintEnd })

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="p-3 rounded-md shadow border bg-card ">
          <div className="pb-2">
            {moment(data.fullDate).format("MMM D, YYYY HH:mm")}
          </div>
          <div className="font-semibold ">Value: {data.value ?? "-"}</div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 🟩 Sprint Burndown (Tasks) */}
      <Card>
        <CardHeader>
          <CardTitle>Sprint Burndown (Tasks)</CardTitle>
          <CardDescription>
            Tracks the remaining number of tasks throughout the sprint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getSprintBurnDownLoading || !TaskchartData.length ? (
            <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
              <BarChart3 className="h-16 w-16 text-muted" />
              <span className="ml-2 text-muted flex items-center gap-2">
                Sprint burndown chart will appear here
                <Loader />
              </span>
            </div>
          ) : (
            <BurnDownChart
              chartData={TaskchartData}
              allTicks={allTicks}
              getSprintBurnDownLoading={getSprintBurnDownLoading}
              CustomTooltip={CustomTooltip}
            />
          )}
        </CardContent>
      </Card>

      {/* 🟦 Sprint Burndown (Story Points) */}
      <Card>
        <CardHeader>
          <CardTitle>Sprint Burndown (Story Points)</CardTitle>
          <CardDescription>
            Shows remaining story points across the sprint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getSprintBurnDownLoading || !PointChartData.length ? (
            <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
              <BarChart3 className="h-16 w-16 text-muted" />
              <span className="ml-2 text-muted flex items-center gap-2">
                Sprint burndown chart will appear here
                <Loader />
              </span>
            </div>
          ) : (
            <BurnDownChart
              chartData={PointChartData}
              allTicks={allTicks}
              getSprintBurnDownLoading={getSprintBurnDownLoading}
              CustomTooltip={CustomTooltip}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
