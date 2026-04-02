"use client"

import {
  MessageCircle,
  CheckCircle,
  Award,
  Zap,
  FileText,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react"
import { Card } from "../../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Badge } from "../../ui/badge"

interface Transaction {
  id: string
  type: "earn" | "spend"
  category: "engagement" | "project" | "skill" | "purchase" | "reward"
  title: string
  description: string
  rpAmount?: number
  scAmount?: number
  timestamp: string
  icon: React.ReactNode
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "earn",
    category: "engagement",
    title: "Helpful Comment",
    description: "Community engagement - answered question in Web Dev channel",
    rpAmount: 15,
    timestamp: "Today at 2:45 PM",
    icon: <MessageCircle className="w-4 h-4" />
  },
  {
    id: "2",
    type: "earn",
    category: "project",
    title: "Project Milestone Completed",
    description: 'Completed "Build REST API" milestone with 95% score',
    rpAmount: 150,
    scAmount: 50,
    timestamp: "Today at 10:15 AM",
    icon: <CheckCircle className="w-4 h-4" />
  },
  {
    id: "3",
    type: "earn",
    category: "skill",
    title: "Skill Verified",
    description: "React skill verified by mentor Sarah Chen",
    rpAmount: 75,
    timestamp: "Yesterday at 4:30 PM",
    icon: <Award className="w-4 h-4" />
  },
  {
    id: "4",
    type: "spend",
    category: "purchase",
    title: "Course Access Purchased",
    description: "Advanced Next.js Masterclass - Full Access",
    scAmount: 120,
    timestamp: "March 15",
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: "5",
    type: "earn",
    category: "reward",
    title: "Monthly Engagement Bonus",
    description: 'Top contributor in "Web Development" community',
    rpAmount: 200,
    scAmount: 100,
    timestamp: "March 10",
    icon: <Award className="w-4 h-4" />
  },
  {
    id: "6",
    type: "spend",
    category: "purchase",
    title: "Premium Mentorship",
    description: "1-on-1 mentoring session with industry expert",
    scAmount: 75,
    timestamp: "March 8",
    icon: <FileText className="w-4 h-4" />
  }
]

const categoryColors: Record<string, string> = {
  engagement: "bg-blue-50 text-blue-700 border-blue-200",
  project: "bg-green-50 text-green-700 border-green-200",
  skill: "bg-purple-50 text-purple-700 border-purple-200",
  purchase: "bg-orange-50 text-orange-700 border-orange-200",
  reward: "bg-yellow-50 text-yellow-700 border-yellow-200"
}

export function TransactionLedger() {
  const earnTransactions = transactions.filter((t) => t.type === "earn")
  const spendTransactions = transactions.filter((t) => t.type === "spend")

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">
        Transaction History
      </h3>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="earn">Earned</TabsTrigger>
          <TabsTrigger value="spend">Spent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </TabsContent>

        <TabsContent value="earn" className="space-y-3">
          {earnTransactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </TabsContent>

        <TabsContent value="spend" className="space-y-3">
          {spendTransactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div
        className={`p-2 rounded-lg flex items-center justify-center w-10 h-10 ${categoryColors[transaction.category]}`}
      >
        {transaction.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground">
            {transaction.title}
          </h4>
          <Badge variant="outline" className="text-xs">
            {transaction.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {transaction.description}
        </p>
        <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        {transaction.rpAmount && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              transaction.type === "earn"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            {transaction.type === "earn" ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownLeft className="w-4 h-4" />
            )}
            {transaction.rpAmount > 0 && transaction.type === "spend"
              ? "-"
              : "+"}
            {transaction.rpAmount} RP
          </div>
        )}
        {transaction.scAmount && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              transaction.type === "earn"
                ? "text-purple-600"
                : "text-muted-foreground"
            }`}
          >
            {transaction.type === "earn" ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownLeft className="w-4 h-4" />
            )}
            {transaction.scAmount > 0 && transaction.type === "spend"
              ? "-"
              : "+"}
            {transaction.scAmount} SC
          </div>
        )}
      </div>
    </div>
  )
}
