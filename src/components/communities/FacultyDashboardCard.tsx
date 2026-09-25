import React from "react"
import Link from "next/link"
import { LayoutDashboard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { buttonVariants } from "../ui/button"
import { cn } from "@/src/lib/utils"

interface FacultyDashboardCardProps {
  communitySlug: string
}

const FacultyDashboardCard: React.FC<FacultyDashboardCardProps> = ({
  communitySlug
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base lg:text-lg">
          Faculty Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-xs lg:text-sm text-muted-foreground">
          Monitor advisor requests, project progress, and milestones across this
          community.
        </p>
        <Link
          href={`/communities/${communitySlug}/faculty-dashboard`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between"
          )}
        >
          <span className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Open Dashboard
          </span>
        </Link>
      </CardContent>
    </Card>
  )
}

export default FacultyDashboardCard
