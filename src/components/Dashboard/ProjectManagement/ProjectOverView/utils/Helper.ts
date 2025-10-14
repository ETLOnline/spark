import moment from "moment"

export function generateBenchmarkData(totalValue: number, allDays: string[]) {
  if (!totalValue || !allDays.length) return []

  // Count how many working-day steps there are (including duplicates)
  const workingDaySteps = allDays.filter((d) => {
    const dow = moment(d).day()
    return dow !== 0 && dow !== 6 // exclude Sat/Sun
  }).length

  // Calculate how much to decrease per working-day step
  const dailyDecrease = totalValue / Math.max(workingDaySteps - 1, 1)
  let currentValue = totalValue
  let lastWorkdayValue = totalValue

  return allDays.map((d) => {
    const dow = moment(d).day()

    if (dow === 6 || dow === 0) {
      // 🟡 Weekend — keep last working day's value
      return { day: d, benchmark: parseFloat(lastWorkdayValue.toFixed(2)) }
    } else {
      // 🟢 Working day (including duplicates)
      const val = Math.max(currentValue, 0)
      currentValue -= dailyDecrease
      lastWorkdayValue = val
      return { day: d, benchmark: parseFloat(val.toFixed(2)) }
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
