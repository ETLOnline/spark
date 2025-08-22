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
import { Switch } from "@/src/components/ui/switch"
import { Textarea } from "@/src/components/ui/textarea"
import { InsertSpace } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useAuthUser } from "@/src/hooks/useAuthUser"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateSpaceAction,
  IsSlugAvailableAction,
  UpdateSpaceAction
} from "@/src/server-actions/Space/Space"
import { channelStore } from "@/src/store/channel/channelStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { slugify } from "@/src/utils/helpers"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { CircleCheck, CircleXIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { space } from "postcss/lib/list"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"

interface Props {
  spaceFormModelVisibility: boolean
  setSpaceFormModelVisibility: React.Dispatch<React.SetStateAction<boolean>>
  shouldRedirect?: boolean
  canSetSpaceSetting?: boolean
}

const spaceSchema = z.object({
  space_name: z.string().min(1, "Space name required").max(30, "Too long"),
  space_slug: z.string().max(50, "Slug is too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(150, "Description is too long"),
  space_type: z.string().min(1, "Space type requied"),
  publish_space: z.boolean().optional()
})

function CreateSpaceModal({
  spaceFormModelVisibility,
  setSpaceFormModelVisibility,
  shouldRedirect,
  canSetSpaceSetting
}: Props) {
  const router = useRouter()
  const authUser = useAtomValue(userStore.AuthUser)
  const selectedChannel = useAtomValue(channelStore.selectedChannel)
  const [selectedSpace, setSelectedSpace] = useAtom(spaceStore.selectedSpace)
  const [spaces, setSpaces] = useAtom(spaceStore.spaces)
  const { refreshAuthUser, isReloadingPermissions } = useAuthUser()

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
    const generatedSlug = slugify(slug)

    if (value && selectedSpace?.space_slug !== generatedSlug) {
      debouncedCheckSlugAvailability(
        generatedSlug,
        () => {
          form.clearErrors("space_slug")
          setslugAvailableMessage(`${generatedSlug} is available`)
        },
        () => {
          form.setError("space_slug", {
            type: "manual",
            message: `${generatedSlug} is already taken`
          })
          setslugAvailableMessage("")
        }
      )
    } else {
      setslugAvailableMessage("")
    }
    form.setValue("space_slug", generatedSlug)
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
      if (selectedSpace.publish_space === 1) {
        form.setValue("publish_space", true)
      } else {
        form.setValue("publish_space", false)
      }
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
    if (data.publish_space === true) {
      data.publish_space = 1
    } else {
      data.publish_space = 0
    }
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
      data.publish_space = data.publish_space ? 1 : 0

      const createdSpace = await CreateNewSpace(data as InsertSpace)
      if (createdSpace?.success && createdSpace.data) {
        await refreshAuthUser()
        setSpaces([...spaces, createdSpace.data])
        router.push(
          `./spaces/${createdSpace.data.space_slug}?page-type=settings`
        )
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
        setSpaces((prevSpace) =>
          prevSpace.map((space) =>
            space.id === selectedSpace?.id
              ? { ...space, ...updatedSpace.data }
              : space
          )
        )
        setSpaceFormModelVisibility(false)
        toast({
          title: "Space updated",
          description: "Your space has been updated successfully.",
          duration: 3000
        })
        if (shouldRedirect) {
          if ("space_slug" in updatedSpace.data) {
            router.push(
              `/channels/${selectedChannel?.channel_slug}/spaces/${updatedSpace.data.space_slug}`
            )
          }
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
        <DialogContent className="max-h-[98vh]">
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
              {/* Space Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="space_name">Space Name</Label>
                <Controller
                  name="space_name"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="space_name"
                      placeholder="Enter space name"
                      {...field}
                      className="col-span-3"
                    />
                  )}
                />
                {error.space_name && (
                  <span className="text-red-500 text-sm">
                    {String(error.space_name.message)}
                  </span>
                )}
              </div>

              {/* Space Slug */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="space_slug">Space Slug</Label>
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
                {error.space_slug && !isSlugAvailableLoading && (
                  <div className="flex items-center text-red-500 gap-x-2 pt-1">
                    <CircleXIcon className="h-4 w-4" />
                    <span className="text-sm">
                      {String(error.space_slug.message)}
                    </span>
                  </div>
                )}
                {isSlugAvailableLoading && (
                  <div className="flex items-center gap-x-2 pt-1">
                    <Loader size={LoaderSizes.sm} />
                    <span className="text-gray-500 text-sm">
                      Checking slug availability
                    </span>
                  </div>
                )}
                {slugAvailableMessage && !isSlugAvailableLoading && (
                  <div className="flex items-center gap-x-2 pt-1 text-green-500">
                    <CircleCheck className="h-4 w-4" />
                    <span className="text-sm">{slugAvailableMessage}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => {
                    const charCount = field.value?.length || 0
                    const maxChars = 150
                    return (
                      <>
                        <Textarea
                          id="description"
                          placeholder="Description"
                          {...field}
                          className="col-span-3"
                          maxLength={maxChars}
                        />
                        <div className="text-sm flex justify-between items-center text-muted-foreground text-right mt-1">
                          {error.description && (
                            <span className="text-red-500 text-sm">
                              {String(error.description.message)}
                            </span>
                          )}
                          <span className="ml-auto">
                            {charCount}/{maxChars} Characters
                          </span>
                        </div>
                      </>
                    )
                  }}
                />
              </div>

              {/* Space Type */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="space_type">Space Type</Label>
                <Controller
                  name="space_type"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                {error.space_type && (
                  <span className="text-red-500 text-sm">
                    {String(error.space_type.message)}
                  </span>
                )}
              </div>

              {/* Publish Space */}
              <div className="flex items-center justify-between">
                <Label htmlFor="publish_space">Publish Space</Label>
                <Controller
                  name="publish_space"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
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
                  disabled={!!error.space_name?.message}
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
