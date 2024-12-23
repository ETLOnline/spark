import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { BookOpen, Users, Zap } from 'lucide-react'
import { Separator } from '../../ui/separator'
import { ProjectProposal } from '.'


interface Props {
  proposals: ProjectProposal[]
}

function IncubatorStats({ proposals }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incubator Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              Active Projects
            </span>
            <span className="font-bold">
              {proposals.filter((p) => p.status === "active").length}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Total Contributors
            </span>
            <span className="font-bold">
              {proposals.reduce((acc, p) => acc + p.contributors, 0)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              Completed Projects
            </span>
            <span className="font-bold">
              {proposals.filter((p) => p.status === "completed").length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default IncubatorStats