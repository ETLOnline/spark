"use client"

import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/Loader/types/loader-types"
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
import { InsertSpace, SelectSpace } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateSpaceAction,
  IsSlugAvailableAction,
  UpdateSpaceAction
} from "@/src/server-actions/Space/Space"
import { channelStore } from "@/src/store/channel/channelStore"
import { navStore } from "@/src/store/nav/navStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { checkSlugAvailability } from "@/src/utils/helpers"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { CircleCheck, CirclePlus, CircleXIcon } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

interface spaceProps {
  space: SelectSpace[]
  setSpace: Dispatch<SetStateAction<SelectSpace[]>>
}

const spaceSchema = z.object({
  space_name: z.string().min(1, "Space name required").max(30, "Too long"),
  space_slug: z.string().max(15, "Slug is too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(50, "Description is too long")
})

function CreateSpaceModal({ space, setSpace }: spaceProps) {
  const authUser = useAtomValue(userStore.AuthUser)
  const currChannel = useAtomValue(channelStore.selectedChannel)
  const setRoutes = useSetAtom(navStore.routes)

  const [slugAvailableMessage, setslugAvailableMessage] = useState<string>("")
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] = useAtom(
    spaceStore.spaceFormModelVisibility
  )
  const [selectedSpace, setSelectedSpace] = useAtom(spaceStore.selectedSpace)
  const [editSpace, setEditSpace] = useState(false)
  const [channel, setChannel] = useAtom(channelStore.selectedChannel)

  const timeoutId = useRef<NodeJS.Timeout>(null)

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

  useEffect(() => {
    const value = form.getValues("space_name")?.trim()
    const slug = `${value}${form.getValues("space_slug")?.trim()}`

    if (value) {
      ;(async () => {
        timeoutId.current = await checkSlugAvailability(
          slug,
          timeoutId.current,
          async () =>
            (
              await isSlugAvailable(slug, channel?.id as string)
            )?.data,
          setslugAvailableMessage,
          () =>
            form.setError("space_slug", {
              type: "manual",
              message: `the slug, ${slug
                .replaceAll(" ", "-")
                .toLowerCase()} is already taken`
            }),
          () => form.clearErrors("space_slug")
        )
      })()
    }
  }, [form.watch("space_name")])

  useEffect(() => {
    const value = form.getValues("space_slug")?.trim()
    const slug = `${form.getValues("space_name")?.trim()}${value}`

    if (value) {
      ;(async () => {
        timeoutId.current = await checkSlugAvailability(
          slug,
          timeoutId.current,
          async () =>
            (
              await isSlugAvailable(slug, channel?.id as string)
            )?.data,
          setslugAvailableMessage,
          () =>
            form.setError("space_slug", {
              type: "manual",
              message: `the slug, ${slug
                .replaceAll(" ", "-")
                .toLowerCase()} is already taken`
            }),
          () => form.clearErrors("space_slug")
        )
      })()
    }
  }, [form.watch("space_slug")])

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
        description: ""
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
      data.channel_id = currChannel?.id as string
      data.space_name = (data.space_name as string).trim()
      data.space_slug = `${data.space_name}${data.space_slug?.trim()}`
        .replaceAll(" ", "-")
        .toLowerCase()
      const createdSpace = await CreateNewSpace(data as InsertSpace)
      if (createdSpace?.success && createdSpace.data) {
        setSpace([...space, ...createdSpace.data])
        setRoutes((routes) => ({
          ...routes,
          navChannels: routes.navChannels.map((channel) =>
            channel.url.includes(currChannel?.channel_slug as string)
              ? {
                  ...channel,
                  items: [
                    ...(channel.items ?? []),
                    {
                      title: createdSpace.data[0].space_name,
                      url: `/channels/${currChannel?.channel_slug}/spaces/${createdSpace.data[0].space_slug}`
                    }
                  ]
                }
              : channel
          )
        }))
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
      data.channel_id = channel?.id
      data.space_name = (data.space_name as string).trim()
      data.space_slug = `${data.space_name}-${data.space_slug?.trim()}`
        .replaceAll(" ", "-")
        .toLowerCase()
      const UpdateSpaceModal = await updateSpace(
        selectedSpace?.id as string,
        data as InsertSpace
      )
      if (UpdateSpaceModal?.success && UpdateSpaceModal.data) {
        setSpace((spaces) =>
          spaces.map((space) =>
            space.id === selectedSpace?.id
              ? { ...space, ...UpdateSpaceModal.data }
              : space
          )
        )
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
            <CirclePlus className="h-4 w-4" />
            Create Space
          </Button>
        </DialogTrigger>
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
                          variant="resistive"
                          prefix={form.getValues("space_name")}
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
