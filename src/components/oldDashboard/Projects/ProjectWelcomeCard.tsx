import React, { SetStateAction } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import CreateNewProposal from './CreateNewProposal';


interface Props {
  newProposal: {
    title: string;
    description: string;
    category: string;
  }
  setNewProposal: (value: SetStateAction<{
    title: string;
    description: string;
    category: string;
  }>) => void
  categories: string[]
  handleCreateProposal: () => void

}



function WelcomeCard({ newProposal, setNewProposal, categories, handleCreateProposal }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Incubator</CardTitle>
        <CardDescription>
          Submit, refine, and collaborate on innovative project ideas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold tracking-tight">
              Welcome to the Incubator
            </h3>
            <p className="text-sm text-muted-foreground">
              Here, ideas become reality. Submit your project proposal or
              contribute to existing ones.
            </p>
          </div>
          <CreateNewProposal newProposal={newProposal} setNewProposal={setNewProposal} categories={categories} handleCreateProposal={handleCreateProposal} />
        </div>
      </CardContent>
    </Card>
  )
}

export default WelcomeCard