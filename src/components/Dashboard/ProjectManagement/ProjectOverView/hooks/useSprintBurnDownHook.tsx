import { useServerAction } from "@/src/hooks/useServerAction"
import { getSprintBurnDownAction } from "@/src/server-actions/Sprint/sprint"
import { eachDayOfInterval, format } from "date-fns"
import moment from "moment"
import { useEffect, useState } from "react"
import { formatDate, generateBenchmarkData } from "../utils/Helper"

interface Props {
  sprintId: string
  sprintStart: string
  sprintEnd: string
}

function useSprintBurnDownHook({ sprintId, sprintStart, sprintEnd }: Props) {
  const [TaskchartData, setTaskChartData] = useState<
    {
      day: string
      value: number | null
      fullDate: string
      benchmark?: number
    }[]
  >([])
  const [PointChartData, setPointChartData] = useState<
    {
      day: string
      value: number | null
      fullDate: string
      benchmark?: number
    }[]
  >([])
  const [allTicks, setAllTicks] = useState<string[]>([])

  const [getSprintBurnDownLoading, , , getSprintBurnDown] = useServerAction(
    getSprintBurnDownAction
  )

  useEffect(() => {
    if (!sprintId || !sprintStart || !sprintEnd) return
    ;(async () => {
      const res = await getSprintBurnDown(sprintId)
      const events = res?.data || []

      events.sort(
        (a, b) =>
          moment(a.created_at ?? "").valueOf() -
          moment(b.created_at ?? "").valueOf()
      )

      const startDate = moment(sprintStart).startOf("day")
      const endDate = moment(sprintEnd).endOf("day")

      const allDays = eachDayOfInterval({
        start: startDate.toDate(),
        end: endDate.toDate()
      }).map((d) => formatDate(String(d)))

      const dayMap: Record<
        string,
        { remainingTasks: number; storyPoints: number; fullDate: string }[]
      > = {}

      for (const ev of events) {
        const dayKey = formatDate(ev.created_at ?? "")
        const fullDay = moment(ev.created_at ?? "").format("YYYY-MM-DD HH:mm")
        const remainingTasks = (ev.total_tasks || 0) - (ev.completed_tasks || 0)
        const storyPoints = ev.total_story_points ?? 0

        if (!dayMap[dayKey]) {
          dayMap[dayKey] = []
        }
        dayMap[dayKey].push({ remainingTasks, storyPoints, fullDate: fullDay })
      }

      const taskPoints: {
        day: string
        value: number | null
        fullDate: string
      }[] = []
      const pointPoints: {
        day: string
        value: number | null
        fullDate: string
      }[] = []

      const eventDays = events.map((ev) => formatDate(ev.created_at ?? ""))
      const firstEventDay = eventDays[0]
      const lastEventDay = eventDays[eventDays.length - 1]

      for (const day of allDays) {
        if (day < firstEventDay) {
          taskPoints.push({ day, value: 0, fullDate: day })
          pointPoints.push({ day, value: 0, fullDate: day })
        } else if (dayMap[day]) {
          for (const ev of dayMap[day]) {
            const fullDate = ev.fullDate
            taskPoints.push({ day, value: ev.remainingTasks, fullDate })
            pointPoints.push({ day, value: ev.storyPoints, fullDate })
          }
        } else if (day > lastEventDay) {
          taskPoints.push({ day, value: null, fullDate: day })
          pointPoints.push({ day, value: null, fullDate: day })
        }
      }

      const totalTasks = events[0]?.total_tasks ?? 0
      const totalPoints = events[0]?.total_story_points ?? 0

      const taskDAys = taskPoints.map((d) => d.day)
      const pointDAys = pointPoints.map((d) => d.day)

      const taskBenchmark = generateBenchmarkData(totalTasks, allDays)
      const pointBenchmark = generateBenchmarkData(totalPoints, allDays)

      // ✅ Merge into existing arrays
      const dayUsage: Record<string, number> = {}

      const taskBenchmarkMap = Object.fromEntries(
        taskBenchmark.map((b) => [b.day, b.benchmark])
      )

      const mergedTasks = taskPoints.map((d) => ({
        ...d,
        benchmark: taskBenchmarkMap[d.day]
      }))

      const pointDayUsage: Record<string, number> = {}

      const pointBenchmarkMap = Object.fromEntries(
        pointBenchmark.map((b) => [b.day, b.benchmark])
      )

      const mergedPoints = pointPoints.map((d) => ({
        ...d,
        benchmark: pointBenchmarkMap[d.day]
      }))

      const forwardFillUntilToday = <
        T extends { day: string; value: number | null }
      >(
        data: T[]
      ): T[] => {
        const todayKey = formatDate(new Date().toISOString())

        let lastValue: number | null = null
        let hasSeenFirstValue = false

        return data.map((item) => {
          if (item.value !== null && item.value !== undefined) {
            lastValue = item.value
            hasSeenFirstValue = true
            return item
          }

          if (hasSeenFirstValue && lastValue !== null && item.day <= todayKey) {
            return {
              ...item,
              value: lastValue
            }
          }

          return item
        })
      }

      const filledTasks = forwardFillUntilToday(mergedTasks)
      const filledPoints = forwardFillUntilToday(mergedPoints)

      const addFakePointIfSingleAtStart = <
        T extends {
          day: string
          value: number | null
          fullDate: string
          benchmark?: number
        }
      >(
        data: T[]
      ): T[] => {
        const realValues = data.filter(
          (d) => d.value !== null && d.value !== undefined
        )

        if (realValues.length === 1) {
          const onlyPoint = realValues[0]

          const fakeFullDate = moment(onlyPoint.fullDate)
            .add(1, "minute")
            .format("YYYY-MM-DD HH:mm")

          const fakePoint = {
            ...onlyPoint,
            fullDate: fakeFullDate
          }

          return [...data, fakePoint].sort(
            (a, b) =>
              moment(a.fullDate).valueOf() - moment(b.fullDate).valueOf()
          )
        }

        // Otherwise return original array
        return data
      }

      setTaskChartData(addFakePointIfSingleAtStart(filledTasks))
      setPointChartData(addFakePointIfSingleAtStart(filledPoints))
      setAllTicks(allDays)
    })()
  }, [sprintId, sprintStart, sprintEnd])

  return {
    TaskchartData,
    PointChartData,
    allTicks,
    getSprintBurnDownLoading
  }
}

export default useSprintBurnDownHook
