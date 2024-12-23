import React, { Dispatch, SetStateAction, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'

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
          <Dialog>
            <DialogTrigger asChild>
              <Button>Submit New Proposal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Project Proposal</DialogTitle>
                <DialogDescription>
                  Share your innovative idea with the community. Be clear and
                  concise.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newProposal.title}
                    onChange={(e) =>
                      setNewProposal({
                        ...newProposal,
                        title: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={newProposal.category}
                    onChange={(e) =>
                      setNewProposal({
                        ...newProposal,
                        category: e.target.value,
                      })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option className='bg-background' value="">Select a category</option>
                    {categories.map((category) => (
                      <option className='bg-background' key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newProposal.description}
                    onChange={(e) =>
                      setNewProposal({
                        ...newProposal,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateProposal}>
                  Submit Proposal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default WelcomeCard