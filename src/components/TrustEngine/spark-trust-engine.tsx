"use client"

import Link from "next/link"
import { Zap, Users, BarChart3, Award, TrendingUp, Target } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"

export default function SparkTrustEngine() {
  const features = [
    {
      icon: Zap,
      title: "Dual-Currency System",
      description:
        "Earn Reputation Points for learning and Spark Credits for achievements",
      href: "/spark/onboarding"
    },
    {
      icon: Award,
      title: "Level Progression",
      description:
        "Unlock opportunities as you advance through 5 distinct trust levels",
      href: "/spark/dashboard"
    },
    {
      icon: Users,
      title: "Community Ranking",
      description:
        "Compete fairly on community leaderboards and track your growth",
      href: "/spark/dashboard?tab=ranking"
    },
    {
      icon: BarChart3,
      title: "Transaction Ledger",
      description:
        "See exactly how you earned or spent your reputation and credits",
      href: "/spark/dashboard?tab=transactions"
    },
    {
      icon: Target,
      title: "Opportunity Gating",
      description: "Discover what new opportunities unlock at each level",
      href: "/spark/dashboard?tab=opportunities"
    },
    {
      icon: TrendingUp,
      title: "Advisor Tools",
      description:
        "Mentors can track student progress and award meaningful achievements",
      href: "/spark/advisor"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br  pt-10 from-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Trust & Reputation System
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            SPARK Trust Engine
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            A comprehensive dual-currency reputation system that rewards
            learning, collaboration, and growth. Track your journey from Spark
            Starter to Spark Champion.
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/spark/onboarding">
              <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/spark/dashboard">
              <Button variant="outline" className="px-8 py-6 text-lg">
                View Dashboard
              </Button>
            </Link>
          </div> */}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index}>
                <Card className="p-6 h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                  <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Trust Metrics Section */}
        <Card className="p-8 md:p-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-3xl font-bold text-primary mb-2">2</h4>
              <p className="text-muted-foreground">Currency Types</p>
              <p className="text-xs text-muted-foreground mt-1">RP & SC</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-primary mb-2">5</h4>
              <p className="text-muted-foreground">Trust Levels</p>
              <p className="text-xs text-muted-foreground mt-1">
                From Starter to Champion
              </p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-primary mb-2">∞</h4>
              <p className="text-muted-foreground">Opportunities</p>
              <p className="text-xs text-muted-foreground mt-1">
                Unlock as you progress
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link href="/profile">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">
                Student Dashboard
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                View your reputation, spark credits, levels, and community
                ranking
              </p>
              <Badge className="bg-primary/20 text-primary border-0">
                Explore
              </Badge>
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">
                Advisor Dashboard
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage mentees, assign milestones, and track their progress
              </p>
              <Badge className="bg-primary/20 text-primary border-0">
                Explore
              </Badge>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
