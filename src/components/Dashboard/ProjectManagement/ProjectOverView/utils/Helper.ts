import moment from "moment"

export function generateBenchmarkData(
  total: number,
  days: string[]
): { day: string; benchmark: number }[] {
  if (!days.length || total === 0) return []

  // Count working days (Mon–Fri)
  const workingDays = days.filter((day) => {
    const d = moment(day, "YYYY-MM-DD")
    const dow = d.day()
    return dow !== 0 && dow !== 6
  })

  const burnPerDay =
    workingDays.length > 1 ? total / (workingDays.length - 1) : total

  let currentValue = total

  return days.map((day, index) => {
    const d = moment(day, "YYYY-MM-DD")
    const dow = d.day()
    const isWeekend = dow === 0 || dow === 6

    // Decrease only on weekdays (except first day)
    if (!isWeekend && index !== 0) {
      currentValue = Math.max(currentValue - burnPerDay, 0)
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
