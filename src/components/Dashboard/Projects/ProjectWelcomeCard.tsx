import React, { SetStateAction } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import CreateNewProposal from './CreateNewProposal';



function WelcomeCard() {
  return (
    <Card className=" p-0 pt-4" >

      <CardContent>
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold tracking-tight">
              Welcome to the Project Spaces
            </h3>
            <p className="text-sm text-muted-foreground">
              Here, ideas become reality. Submit, refine, and collaborate on innovative project ideas or
              contribute to existing ones.
            </p>
          </div>
          <CreateNewProposal />
        </div>
      </CardContent>
    </Card>
  )
}

export default WelcomeCard