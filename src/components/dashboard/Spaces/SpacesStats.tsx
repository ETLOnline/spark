"use client"

import CommunityStatsCard from "./CommunityStatsCard"
import TrendingTopicsCard from "./TrendingTopicsCard"
import UpcomingEventsCard from "./UpcomingEventsCard"
import { useDetectBreakpoint } from "@/src/hooks/useBreakpoint"
import { MessageCircle, Users } from "lucide-react"
import { Event, Topic, Stat } from "./types/spaces-types"

const upcomingEvents: Event[] = [
  { name: "TechConf 2023", date: "2023-09-15" },
  { name: "AI Summit", date: "2023-10-02" },
  { name: "DevOps Day", date: "2023-10-20" }
]

const trendingTopics: Topic[] = [
  { name: "React Hooks", posts: 120 },
  { name: "GPT-4", posts: 98 },
  { name: "Kubernetes", posts: 85 },
  { name: "Web3", posts: 72 },
  { name: "Flutter", posts: 65 }
]

const stats: Stat[] = [
  {
    name: "Members",
    amount: 100,
    icon: <Users className="mr-2 h-4 w-4 text-primary" />
  },
  {
    name: "Posts Today",
    amount: 237,
    icon: <MessageCircle className="mr-2 h-4 w-4 text-primary" />
  },
  {
    name: "New Members (This Week)",
    amount: 89,
    icon: <Users className="mr-2 h-4 w-4 text-primary" />
  }
]

const SpacesStats = () => {
  const isMobileOrTab = useDetectBreakpoint(945)

  return (
    !isMobileOrTab && (
      <aside className="space-y-4 space-info pt-[128px] mt-[-128px] sticky top-[16px]">
          <TrendingTopicsCard topics={trendingTopics} />
          <UpcomingEventsCard events={upcomingEvents} />
          <CommunityStatsCard stats={stats} />
      </aside>
    )
  )
}

export default SpacesStats
