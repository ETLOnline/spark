import { BarChart3, TrendingUp, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { TrustDisplay } from "./TrustDisplay"
import { TransactionLedger } from "./TransactionLedger"
import { CommunityRanking } from "./CommunityRanking"

export const metadata = {
  title: "Student Dashboard | SPARK",
  description: "View your reputation points, spark credits, and progress"
}

export default function TrustEngineScreen() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
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
            {/* <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Unlock</span>
            </TabsTrigger> */}
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <TrustDisplay
              reputationPoints={4290}
              sparkCredits={1850}
              level={2}
              nextLevelPoints={3000}
              currentLevelPoints={1500}
              percentile={8}
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
