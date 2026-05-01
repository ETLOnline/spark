export const TrustEngineStats = [
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

interface Ranking {
  rank: number
  name: string
  avatar: string
  rpPoints: number
  growth: number
  isCurrentUser: boolean
  trend: "up" | "down" | "neutral"
}
export const CommunityRankingsData: Ranking[] = [
  {
    rank: 1,
    name: "Sarah Chen",
    avatar: "SC",
    rpPoints: 4850,
    growth: 245,
    isCurrentUser: false,
    trend: "up"
  },
  {
    rank: 2,
    name: "Alex Johnson",
    avatar: "AJ",
    rpPoints: 4620,
    growth: 120,
    isCurrentUser: false,
    trend: "down"
  },
  {
    rank: 3,
    name: "Usama Tariq",
    avatar: "UT",
    rpPoints: 4290,
    growth: 280,
    isCurrentUser: true,
    trend: "up"
  },
  {
    rank: 4,
    name: "Emma Davis",
    avatar: "ED",
    rpPoints: 4150,
    growth: 85,
    isCurrentUser: false,
    trend: "neutral"
  },
  {
    rank: 5,
    name: "Marco Silva",
    avatar: "MS",
    rpPoints: 3920,
    growth: 180,
    isCurrentUser: false,
    trend: "up"
  }
]

export interface TransactionType {
  id: string
  type: "earn" | "spend"
  category: "engagement" | "project" | "skill" | "purchase" | "reward"
  title: string
  description: string
  rpAmount?: number
  scAmount?: number
  timestamp: string
}

export const TransactionsData: TransactionType[] = [
  {
    id: "1",
    type: "earn",
    category: "engagement",
    title: "Helpful Comment",
    description: "Community engagement - answered question in Web Dev channel",
    rpAmount: 15,
    timestamp: "Today at 2:45 PM"
  },
  {
    id: "2",
    type: "earn",
    category: "project",
    title: "Project Milestone Completed",
    description: 'Completed "Build REST API" milestone with 95% score',
    rpAmount: 150,
    scAmount: 50,
    timestamp: "Today at 10:15 AM"
  },
  {
    id: "3",
    type: "earn",
    category: "skill",
    title: "Skill Verified",
    description: "React skill verified by mentor Sarah Chen",
    rpAmount: 75,
    timestamp: "Yesterday at 4:30 PM"
  },
  {
    id: "4",
    type: "spend",
    category: "purchase",
    title: "Course Access Purchased",
    description: "Advanced Next.js Masterclass - Full Access",
    scAmount: 120,
    timestamp: "March 15"
  },
  {
    id: "5",
    type: "earn",
    category: "reward",
    title: "Monthly Engagement Bonus",
    description: 'Top contributor in "Web Development" community',
    rpAmount: 200,
    scAmount: 100,
    timestamp: "March 10"
  },
  {
    id: "6",
    type: "spend",
    category: "purchase",
    title: "Premium Mentorship",
    description: "1-on-1 mentoring session with industry expert",
    scAmount: 75,
    timestamp: "March 8"
  }
]

export const LevelTitles = [
  "Spark Starter",
  "Spark Contributor",
  "Spark Collaborator",
  "Spark Leader",
  "Spark Champion"
]
