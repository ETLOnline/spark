import { MessageCircle, Users } from "lucide-react"
import Categories from "@/src/components/dashboard/Spaces/categories"
import {
  Event,
  Topic,
  Stat
} from "../../../components/dashboard/Spaces/types/spaces"
import TrendingTopics from "@/src/components/dashboard/Spaces/trending-topics"
import UpcomingEvents from "@/src/components/dashboard/Spaces/upcoming-events"
import CommunityStats from "@/src/components/dashboard/Spaces/community-stats"

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

const SpacesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <section className="flex space-x-4 w-full">
        <Categories />
      </section>
      <div className="flex-grow flex space-x-4">
        <main className="w-3/4 space-y-4 post-feed">{children}</main>
        <aside className="w-1/4 space-y-4 space-info">
          <TrendingTopics topics={trendingTopics} />
          <UpcomingEvents events={upcomingEvents} />
          <CommunityStats stats={stats} />
        </aside>
      </div>
    </div>
  )
}

export default SpacesLayout
