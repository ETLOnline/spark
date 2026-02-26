import moment from "moment"

export function generateBenchmarkData(
  total: number,
  days: string[]
): { day: string; benchmark: number }[] {
  if (!days.length || total <= 0) return []

  // Normalize to YYYY-MM-DD (ignore time)
  const getDateOnly = (d: string) => moment(d).format("YYYY-MM-DD")

  // Count occurrences per calendar day
  const dayCounts: Record<string, number> = {}
  days.forEach((d) => {
    const key = getDateOnly(d)
    dayCounts[key] = (dayCounts[key] || 0) + 1
  })

  // Unique working days (Mon–Fri)
  const uniqueWorkingDays = Object.keys(dayCounts).filter((day) => {
    const dow = moment(day, "YYYY-MM-DD").day()
    return dow !== 0 && dow !== 6
  })

  // Burn so last working day becomes 0
  const burnPerDay =
    uniqueWorkingDays.length > 1
      ? total / (uniqueWorkingDays.length - 1)
      : total

  let currentValue = total
  let firstWorkingDayPassed = false

  return days.map((day) => {
    const dateOnly = getDateOnly(day)
    const d = moment(dateOnly, "YYYY-MM-DD")
    const dow = d.day()
    const isWeekend = dow === 0 || dow === 6

    if (!isWeekend) {
      if (firstWorkingDayPassed) {
        // Divide burn across repeats of this day
        const perEntryBurn = burnPerDay / dayCounts[dateOnly]
        currentValue = Math.max(currentValue - perEntryBurn)
      } else {
        firstWorkingDayPassed = true
      }
    }

    return {
      day,
      benchmark: Number(currentValue.toFixed(2))
    }
  })
}

export const calculateChartTicks = (allTicks: string[]) => {
  if (allTicks.length <= 5) return allTicks

  const start = moment(allTicks[0], "YYYY-MM-DD")
  const end = moment(allTicks[allTicks.length - 1], "YYYY-MM-DD")
  const totalDays = end.diff(start, "days")

  // 5 ticks → 4 intervals
  const intervalDays = totalDays / 4
  const ticks = []

  for (let i = 0; i < 5; i++) {
    const tickDate = moment(start)
      .add(intervalDays * i, "days")
      .format("YYYY-MM-DD")
    // snap to the closest available tick
    const closest = allTicks.reduce((a, b) =>
      Math.abs(moment(a).diff(tickDate)) < Math.abs(moment(b).diff(tickDate))
        ? a
        : b
    )
    ticks.push(closest)
  }

  return [...new Set(ticks)]
}

export function calculateYAxisTicks(
  chartData: { value: number | null }[],
  step: number
): number[] {
  if (!chartData || !chartData.length) return [0, 2, 4, 6, 8]

  const maxValue = Math.max(...chartData.map((d) => d.value ?? 0))
  const numberOfTicks = Math.ceil((maxValue + step) / step) + 1

  return Array.from({ length: numberOfTicks }, (_, i) => i * step)
}

export function formatDate(dateString: string) {
  return moment(dateString ?? "").format("YYYY-MM-DD")
}
