import { BarChart3, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TransactionLedger } from "./TransactionLedger"
import { CommunityRanking } from "./CommunityRanking"
import { TrustOverView } from "./TrustOverView"

export const metadata = {
  title: "Student Dashboard | SPARK",
  description: "View your reputation points, spark credits, and progress"
}

export default function TrustEngineScreen() {
  return (
    <main className="min-h-screen bg-background ">
      <div className="container mx-auto px-4 ">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Trust Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your reputation, achievements, and growth
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <TrustOverView
              reputationPoints={0}
              sparkCredits={1850}
              level={0}
              nextLevelPoints={1000}
              currentLevelPoints={0}
              percentile={100}
            />
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionLedger />
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <CommunityRanking />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
