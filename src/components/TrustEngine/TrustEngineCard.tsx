import { Zap } from "lucide-react"
import Link from "next/link"
import { TrustEngineStats } from "./Constant"
import { Card, CardTitle } from "../ui/card"
import { Button } from "../ui/button"

export default function TrustEngineCard() {
  const currentRp = 7250
  const maxRp = 10000
  const progressPercent = (currentRp / maxRp) * 100

  return (
    <Card className="rounded-xl border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Trust Engine
          </CardTitle>
        </div>

        <Button>
          <Link href="/trust-engine/dashboard">View DashBoard</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {TrustEngineStats.map((stat) => (
          <div key={stat.label} className="rounded-lg border p-4">
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
