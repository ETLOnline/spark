"use client"

import { useEffect, useState } from "react"
import { Zap } from "lucide-react"
import { SelectActivityRules, SelectRewardLevel } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetActivityRulesAction,
  getRewardLevelsAction
} from "@/src/server-actions/Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { Badge } from "../ui/badge"

const FEATURED_ACTIVITIES: { type: ActivityTypes; label: string }[] = [
  { type: ActivityTypes.ProfileComplete, label: "Complete Your Profile" },
  { type: ActivityTypes.SocialPost, label: "Share Your First Post" },
  { type: ActivityTypes.PeerReview, label: "Help Another Member" },
  { type: ActivityTypes.MilestoneApproval, label: "Complete a Milestone" },
  {
    type: ActivityTypes.TaskCompletionVerification,
    label: "Get Task Verified"
  }
]

function formatReward(
  rule: SelectActivityRules & { reward?: { display_name: string } | null }
) {
  const currency = rule.reward?.display_name ?? "Points"
  return `+${rule.base_points} ${currency}`
}

interface TrustEngineDetailsProps {
  section?: "intro" | "earn" | "levels" | "all"
}

export function TrustEngineDetails({
  section = "all"
}: TrustEngineDetailsProps) {
  const [rewardRows, setRewardRows] = useState<
    { label: string; reward: string }[]
  >([])
  const [levels, setLevels] = useState<SelectRewardLevel[]>([])

  const [, , , getActivityRules] = useServerAction(GetActivityRulesAction)
  const [, , , getLevels] = useServerAction(getRewardLevelsAction)

  useEffect(() => {
    if (section === "earn" || section === "all") {
      const fetchRewardRows = async () => {
        const rulesRes = await getActivityRules()
        if (rulesRes?.success && rulesRes.data) {
          const rulesMap = new Map(
            rulesRes.data.map((r: any) => [r.action_type, r])
          )
          const rows = FEATURED_ACTIVITIES.flatMap(({ type, label }) => {
            const rule = rulesMap.get(type)
            if (!rule) return []
            return [{ label, reward: formatReward(rule) }]
          })
          setRewardRows(rows)
        }
      }
      fetchRewardRows()
    }

    if (section === "levels" || section === "all") {
      const fetchLevels = async () => {
        const levelsRes = await getLevels()
        if (levelsRes?.success && levelsRes.data) setLevels(levelsRes.data)
      }
      fetchLevels()
    }
  }, [section])

  return (
    <div className="space-y-6">
      {(section === "intro" || section === "all") && (
        <div className="space-y-4">
          <p>
            Every action you take contributes to your reputation in the
            community. We track two key metrics to measure your growth:
          </p>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                Reputation Points (RP)
              </h4>
              <p className="text-sm">
                Earned through learning, contribution, and community engagement.
                Unlocks advanced opportunities.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                Spark Credits (SC)
              </h4>
              <p className="text-sm">
                Earned through milestones and achievements. Spend them on
                premium courses and mentorship.
              </p>
            </div>
          </div>
        </div>
      )}

      {(section === "earn" || section === "all") && (
        <div className="space-y-4">
          <p>Get rewarded for meaningful contributions:</p>
          <div className="space-y-2">
            {rewardRows.map((item, i) => (
              <div
                key={i}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm font-semibold">{item.reward}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(section === "levels" || section === "all") && (
        <div className="space-y-4">
          <p>
            As you accumulate reputation, you&apos;ll progress through distinct
            levels, each unlocking new opportunities:
          </p>
          <div className="space-y-3">
            {levels.map((item, i) => (
              <div
                key={i}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{item.name}</Badge>
                    <span className="text-xs">
                      {item.min_points} - {item.max_points} RP
                    </span>
                  </div>
                  <p className="text-sm">{item.description}</p>
                </div>
                <img
                  src={`/images/rewards/levels/compressed/level-${item.id ?? 1}.png`}
                  className="w-12 h-12"
                  alt=""
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
