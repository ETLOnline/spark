import moment from "moment"

export function generateBenchmarkData(
  total: number,
  days: string[]
): { day: string; benchmark: number }[] {
  if (!days.length || total <= 0) return []

  const getDateOnly = (d: string) => moment(d).format("YYYY-MM-DD")

  // Count ALL working-day entries (including repeats)
  const workingEntries = days.filter((d) => {
    const dow = moment(getDateOnly(d), "YYYY-MM-DD").day()
    return dow !== 0 && dow !== 6
  }).length

  // Burn so last working entry reaches 0
  const burnPerEntry = workingEntries > 1 ? total / (workingEntries - 1) : total

  let currentValue = total
  let firstWorkingEntry = true

  return days.map((day) => {
    const dateOnly = getDateOnly(day)
    const dow = moment(dateOnly, "YYYY-MM-DD").day()
    const isWeekend = dow === 0 || dow === 6

    if (!isWeekend) {
      if (firstWorkingEntry) {
        firstWorkingEntry = false
      } else {
        currentValue = Math.max(currentValue - burnPerEntry, 0)
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
  const intervalDays = totalDays / 7
  const ticks = []

  for (let i = 0; i < 7; i++) {
    const tickDate = moment(start)
      .add(intervalDays * i, "days")
      .format("YYYY-MM-DD")
    // snap to the closest available tick
    const closest = allTicks.reduce((a, b) =>
      Math.abs(moment(a).diff(tickDate)) < Math.abs(moment(b).diff(tickDate))
        ? a
        : b
    )
    console.log("Closest actual tick:", closest)
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
