"use client"
import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { channelstable } from '@/src/db/schema'
import React, { useEffect, useState } from 'react'

export function CreateSpace() {
  const [newSpace, setNewSpace] = useState({
    title: '',
    desscrption: '',
  })
  const [space, setSpace] = useState<{ title: string; desscrption: string }[]>([])

  useEffect(() => {
    console.log(space)
  }, [space])

  function handleCreateSpace() {
    if (
      newSpace.title &&
      newSpace.desscrption
    ) {
      setSpace([...space, newSpace])
    }
    setNewSpace({
      title: '',
      desscrption: '',
    })
  }


  return (

    <div className=" flex  w-full justify-center">
      <Dialog >
        <DialogTrigger>
          <Button variant={'default'}>
            Create Space
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Space</DialogTitle>
            <DialogDescription>You can create Spaces.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id='title'
                placeholder='Enter space title'
                value={newSpace.title}
                onChange={(e) => setNewSpace({ ...newSpace, title: e.target.value })}
                className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id='description'
                value={newSpace.desscrption}
                onChange={(e) => setNewSpace({ ...newSpace, desscrption: e.target.value })}
                className="col-span-3" />

            </div>


          </div>
          <DialogFooter>
            <Button onClick={handleCreateSpace}> Create </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
