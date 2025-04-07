"use client"

import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { InsertSpace } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateSpaceAction,
  IsSlugAvailableAction,
  UpdateSpaceAction
} from "@/src/server-actions/Space/Space"
import { channelStore } from "@/src/store/channel/channelStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { slugAvailibilityMsgGenerator } from "@/src/utils/helpers"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom, useAtomValue } from "jotai"
import { CircleCheck, CircleXIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"

interface Props {
  spaceFormModelVisibility: boolean
  setSpaceFormModelVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

const spaceSchema = z.object({
  space_name: z.string().min(1, "Space name required").max(30, "Too long"),
  space_slug: z.string().max(50, "Slug is too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(150, "Description is too long"),
  space_type: z.string().optional()
})

function CreateSpaceModal({
  spaceFormModelVisibility,
  setSpaceFormModelVisibility
}: Props) {
  const router = useRouter()
  const authUser = useAtomValue(userStore.AuthUser)
  const selectedChannel = useAtomValue(channelStore.selectedChannel)
  const [selectedSpace, setSelectedSpace] = useAtom(spaceStore.selectedSpace)

  const [slugAvailableMessage, setslugAvailableMessage] = useState<string>("")

  const [editSpace, setEditSpace] = useState(false)

  const [addSpaceLoading, addSpaceData, addSpaceError, CreateNewSpace] =
    useServerAction(CreateSpaceAction)
  const [
    isSlugAvailableLoading,
    isSlugAvailableData,
    isSlugAvailableError,
    isSlugAvailable
  ] = useServerAction(IsSlugAvailableAction)
  const [
    addUpdateSpaceLoading,
    addUpdateSpaceData,
    addUpdateSpaceError,
    updateSpace
  ] = useServerAction(UpdateSpaceAction)

  const form = useForm({
    resolver: zodResolver(spaceSchema)
  })
  const error = form.formState.errors

  const debouncedCheckSlugAvailability = useDebouncedCallback(
    async (
      slug: string,
      onAvailable?: () => void,
      onNotAvailable?: () => void
    ) => {
      try {
        const result = await isSlugAvailable(slug, selectedChannel?.id || "")

        if (result && result.data) {
          if (onAvailable) onAvailable()
        } else {
          if (onNotAvailable) onNotAvailable()
        }
      } catch (error) {
        console.error(error)
      }
    },
    1000 // Debounce delay in milliseconds
  )

  useEffect(() => {
    const value = form.getValues("space_name")?.trim() || ""
    const slug = value.replaceAll(" ", "-").toLowerCase()

    if (value && selectedSpace?.space_slug !== slug) {
      debouncedCheckSlugAvailability(
        slug,
        () => {
          form.clearErrors("space_slug")
          setslugAvailableMessage(slugAvailibilityMsgGenerator(true, slug))
        },
        () => {
          form.setError("space_slug", {
            type: "manual",
            message: slugAvailibilityMsgGenerator(false, slug)
          })
          setslugAvailableMessage("")
        }
      )
    } else {
      setslugAvailableMessage("")
    }
    form.setValue("space_slug", slug)
  }, [form.watch("space_name")])

  useEffect(() => {
    form.reset()
    if (!spaceFormModelVisibility) {
      setSelectedSpace(null)
    }
  }, [spaceFormModelVisibility])

  useEffect(() => {
    if (selectedSpace) {
      setEditSpace(true)
      form.setValue("space_name", selectedSpace.space_name)
      form.setValue("description", selectedSpace.description as string)
      form.setValue("space_type", selectedSpace.space_type || "")
    } else {
      setEditSpace(false)
    }
  }, [selectedSpace])

  useEffect(() => {
    if (!spaceFormModelVisibility) {
      // Reset all form fields
      form.reset({
        space_name: "",
        space_slug: "",
        description: "",
        space_type: ""
      })
      // Clear any errors
      form.clearErrors()
      // Reset other state
      setSelectedSpace(null)
      setEditSpace(false)
      setslugAvailableMessage("")
    }
  }, [spaceFormModelVisibility])

  function submitData(data: any) {
    if (!selectedSpace) {
      handleCreateSpace(data)
    } else handleUpdateSpace(data)
  }

  async function handleCreateSpace(data: Partial<InsertSpace>) {
    try {
      data.created_by = authUser?.unique_id as string
      data.channel_id = selectedChannel?.id as string
      data.space_name = (data.space_name || "").trim()
      data.space_slug = data.space_slug?.trim()
      data.space_type = data.space_type || "private"

      const createdSpace = await CreateNewSpace(data as InsertSpace)
      if (createdSpace?.success && createdSpace.data) {
        router.push(`./spaces/${createdSpace.data.space_slug}/settings`)
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

  async function handleUpdateSpace(data: Partial<InsertSpace>) {
    try {
      data.created_by = authUser?.unique_id as string
      data.channel_id = selectedChannel?.id
      data.space_name = (data.space_name || "").trim()
      data.space_slug = data?.space_slug?.trim() || ""

      const updatedSpace = await updateSpace(
        selectedSpace?.id as string,
        data as InsertSpace
      )

      if (updatedSpace?.success && updatedSpace.data) {
        setSpaceFormModelVisibility(false)
        toast({
          title: "Space updated",
          description: "Your space has been updated successfully.",
          duration: 3000
        })
        if (updatedSpace.data && !(updatedSpace.data instanceof Error)) {
          router.push(
            `/channels/${selectedChannel?.channel_slug}/spaces/${updatedSpace.data.space_slug}`
          )
        }
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editSpace === true ? "Edit Space" : "Create Space"}
            </DialogTitle>
            <DialogDescription>
              {editSpace === true
                ? "You can edit Spaces."
                : "You can create Spaces."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(submitData)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="space_name">Title</Label>
                  <div className="w-[70%]">
                    <Controller
                      name="space_name"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="space_name"
                          placeholder="Enter space title"
                          {...field}
                          className="col-span-3"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                  {error.space_name && (
                    <span className="text-red-500 text-sm">
                      {String(error.space_name.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="space_name">Space Slug</Label>
                  <div className="w-[70%]">
                    <Controller
                      name="space_slug"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="space_slug"
                          placeholder="Enter space slug"
                          {...field}
                          className="col-span-3"
                          disabled={true}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                  {error.space_slug && !isSlugAvailableLoading && (
                    <div className="flex items-center text-red-500">
                      <CircleXIcon className="mr-2 h-4 w-4" />
                      <span className="text-sm">
                        {String(error.space_slug.message)}
                      </span>
                    </div>
                  )}
                  {isSlugAvailableLoading && (
                    <>
                      <Loader size={LoaderSizes.sm} />
                      <span className="text-gray-500 text-sm">
                        checking slug availibity
                      </span>
                    </>
                  )}
                  {slugAvailableMessage && !isSlugAvailableLoading && (
                    <div className="flex items-center gap-x-1 text-green-500">
                      <CircleCheck className="mr-2 h-4 w-4" />
                      <span className="text-sm">{slugAvailableMessage}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <div className="w-[70%]">
                    <Controller
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          id="description"
                          placeholder="Description"
                          {...field}
                          className="col-span-3"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                  {error.description && (
                    <span className="text-red-500 text-sm">
                      {String(error.description.message)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="space_type">Space type</Label>
                  <div className="w-[70%]">
                    <Controller
                      name="space_type"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={
                            selectedChannel?.channel_type === "private"
                              ? "private"
                              : field.value
                          }
                          disabled={selectedChannel?.channel_type === "private"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                  {error.space_type && (
                    <span className="text-red-500 text-sm">
                      {String(error.space_type.message)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              {editSpace === true ? (
                <Button
                  onClick={() => form.handleSubmit(submitData)}
                  loading={addUpdateSpaceLoading}
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={addSpaceLoading}
                  disabled={error.space_name?.message ? true : false}
                >
                  Create
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateSpaceModal
