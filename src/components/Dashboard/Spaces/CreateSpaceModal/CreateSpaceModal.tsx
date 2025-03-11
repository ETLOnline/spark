"use client"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { InsertSpace } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { CreateSpaceAction, UpdateSpaceAction } from "@/src/server-actions/Space/space"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom, useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

type CreateSpaceModalProps = {
  channelId: string
}

const spaceSchema = z.object({
  space_name: z.string().min(1, "Space name required").max(30, "Too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(50, "Description is too long")
})

function CreateSpaceModal({ channelId }: CreateSpaceModalProps) {
  const [space, setSpace] = useAtom(spaceStore.spaces)
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] =
    useAtom(spaceStore.spaceFormModelVisibility)
  const [selectedSpace, setSelectedSpace] = useAtom(spaceStore.selectedSpace)
  const [editSpace, setEditSpace] = useState(false)
  const [addSpaceLoading, addSpaceData, addSpaceError, CreateNewSpace] =
    useServerAction(CreateSpaceAction)
  const [addUpdateSpaceLoading, addUpdateSpaceData, addUpdateSpaceError, updateSpace] =
    useServerAction(UpdateSpaceAction)
  const form = useForm<{ space_name: string; description: string }>({
    resolver: zodResolver(spaceSchema)
  })
  const authUser = useAtomValue(userStore.AuthUser)
  const error = form.formState.errors

  useEffect(() => {
    form.reset()
    if (!spaceFormModelVisibility) {
      setSelectedSpace(null)
    }
  }, [spaceFormModelVisibility])

  useEffect(() => {
    if (selectedSpace) {
      setEditSpace(true)
    } else {
      setEditSpace(false)
    }
  }, [selectedSpace])

  useEffect(() => {
    if (selectedSpace) {
      form.setValue("space_name", selectedSpace.space_name)
      form.setValue("description", selectedSpace.description || "")
    }
  }, [selectedSpace])

  function submit(data: { space_name: string; description: string }) {
    if (data && authUser) {
      const spaceData: InsertSpace = {
        ...data,
        created_by: authUser?.unique_id as string,
        channel_id: channelId as string
      }
      if (!selectedSpace) {
        handleCreateSpaceModal(spaceData)
      } else {
        handleUpdateSpace(spaceData)
      }
    }
  }

  async function handleCreateSpaceModal(data: InsertSpace) {
    try {
      const finalData = { ...data }
      finalData.created_by = authUser?.unique_id as string
      finalData.channel_id = channelId as string
      const CreateSpaceModal = await CreateNewSpace(finalData as InsertSpace)
      if (CreateSpaceModal?.success && CreateSpaceModal.data) {
        setSpace([...space, ...CreateSpaceModal.data])
        setSpaceFormModelVisibility(false)
        toast({
          title: "Space created",
          duration: 3000
        })
      }
    } catch {
      toast({
        title: "unable to create space",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  async function handleUpdateSpace(spaceData: InsertSpace) {
    try {
      const finalData = { ...spaceData }
      finalData.created_by = authUser?.unique_id as string
      finalData.channel_id = channelId as string
      const UpdateSpaceModal = await updateSpace(selectedSpace?.id as string, finalData as InsertSpace)
      if (UpdateSpaceModal?.success && UpdateSpaceModal.data) {
        const updatedSpace = space.map((space) => {
          if (space.id === selectedSpace?.id) {
            return { ...space, ...UpdateSpaceModal.data }
          }
          return space
        })
        setSpace(updatedSpace)
        setSpaceFormModelVisibility(false)
        toast({
          title: "Space updated",
          description: "Your space has been updated successfully.",
          duration: 3000
        })
      }
    } catch {
      toast({
        title: "Unable to update space",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  return (
    <div className="flex justify-center">
      <Dialog
        open={spaceFormModelVisibility}
        onOpenChange={(open) => {
          setSpaceFormModelVisibility(open)
        }}
      >
        <DialogTrigger asChild>
          <Button>
            Create Space
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editSpace === true ? "Edit Space" : "Create Space"}
            </DialogTitle>
            <DialogDescription>{editSpace === true ? "You can edit Spaces." : "You can create Spaces."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(submit)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="space_name" className="text-right">
                    Title
                  </Label>
                  <Controller
                    name="space_name"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="space_name"
                        placeholder="Enter space title"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.trimStart())
                        }
                        className="col-span-3"
                      />
                    )}
                  />
                </div>
                <div className="text-right">
                  {error.space_name && (
                    <span className="text-red-500 text-sm">
                      {String(error.space_name.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        id="description"
                        placeholder="Description"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.trimStart())
                        }
                        className="col-span-3"
                      />
                    )}
                  />
                </div>
                <div className="text-right">
                  {error.description && (
                    <span className="text-red-500 text-sm">
                      {String(error.description.message)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              {editSpace === true ?
                <Button
                  onClick={() => form.handleSubmit(submit)}
                  loading={addUpdateSpaceLoading}
                >
                  Save
                </Button> :
                <Button type="submit" loading={addSpaceLoading}>
                  Create
                </Button>
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateSpaceModal
