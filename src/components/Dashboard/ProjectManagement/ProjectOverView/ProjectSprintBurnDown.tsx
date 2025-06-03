import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { BarChart3 } from "lucide-react"

function ProjectSprintBurnDown() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Sprint Burndown</CardTitle>
        <CardDescription>Task completion over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
          <BarChart3 className="h-16 w-16 text-muted" />
          <span className="ml-2 text-muted">
            Sprint burndown chart will appear here
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectSprintBurnDown
