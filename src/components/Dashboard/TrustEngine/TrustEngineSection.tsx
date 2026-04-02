import { Zap, TrendingUp } from "lucide-react"
import { Card, CardTitle } from "../../ui/card"

export default function TrustEngine() {
  const stats = [
    {
      label: "Reputation Points",
      value: "1,250",
      change: "+12% this month",
      color: "text-teal-600 dark:text-teal-400"
    },
    {
      label: "Spark Credits",
      value: "485",
      change: "Available",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      label: "Current Level",
      value: "Spark Mentor",
      change: "Level 4/5",
      color: "text-teal-600 dark:text-teal-400"
    },
    {
      label: "Community Rank",
      value: "#12",
      change: "Top 96%",
      color: "text-orange-600 dark:text-orange-400"
    }
  ]

  const currentRp = 7250
  const maxRp = 10000
  const progressPercent = (currentRp / maxRp) * 100

  return (
    <Card className="rounded-xl border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Zap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Trust Engine
        </CardTitle>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/40 dark:border-slate-700/40 bg-white dark:bg-slate-800/50 p-4"
          >
            <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
            <p className={`mb-1 text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Progress to Next Level
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {currentRp.toLocaleString()} / {maxRp.toLocaleString()} RP
          </span>
        </div>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/40 dark:bg-slate-700/40">
          <div
            className="bg-gradient-to-r from-teal-500 to-blue-500 dark:from-teal-400 dark:to-blue-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="flex-1 bg-transparent" />
        </div>
      </div>
    </Card>
  )
}
