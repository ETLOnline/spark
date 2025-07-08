"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { useAtom, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { InsertChannel, SelectChannel } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateChannelAction,
  IsSlugAvailableAction,
  UpdateChannelAction
} from "@/src/server-actions/Channel/Channel"
import { useToast } from "@/src/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select"
import { channelStore } from "@/src/store/channel/channelStore"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleCheck, CircleXIcon, CirclePlus } from "lucide-react"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/types/loader-types"
import { Switch } from "../../ui/switch"
import { useDebouncedCallback } from "use-debounce"
import { useAuthUser } from "@/src/hooks/useAuthUser"

const channelSchema = z.object({
  channel_name: z
    .string()
    .min(1, "Title required")
    .max(50, "Title is too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(150, "Description is too long"),
  channel_type: z.string().min(1, "Channel type required"),
  channel_slug: z.string().max(50, "Slug is too long"),
  publish_channel: z.boolean().optional()
})

type CreateChannelsProps = {
  onChannelCreated?: (newChannel: SelectChannel) => void
  communityId?: string
  onActionComplete?: (
    channel: SelectChannel,
    actionType: "create" | "update"
  ) => void
}

function CreateChannels({
  onChannelCreated,
  communityId,
  onActionComplete
}: CreateChannelsProps) {
  const { refreshAuthUser, isReloadingPermissions } = useAuthUser()
  const [slugAvailableMessage, setSlugAvailableMessage] = useState<string>("")

  const [channels, setChannels] = useAtom(channelStore.channels)
  const authUser = useAtomValue(userStore.AuthUser)
  const [channelFormModelVisibility, setChannelFormModelVisibility] = useAtom(
    channelStore.channelformModalVisibility
  )
  const [selectedChannel, setSelectedChannel] = useAtom(
    channelStore.selectedChannel
  )
  const isEditMode = useMemo(() => selectedChannel != null, [selectedChannel])

  const [addChannelLoading, addChannelData, addChannelError, CreateChannel] =
    useServerAction(CreateChannelAction)
  const [
    addUpdateChannelLoading,
    addUpdateChannelData,
    addUpdateChannelError,
    UpdateChannel
  ] = useServerAction(UpdateChannelAction)
  const [
    isSlugAvailableLoading,
    isSlugAvailableData,
    isSlugAvailableError,
    checkSlugAvailability
  ] = useServerAction(IsSlugAvailableAction)

  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(channelSchema)
  })

  const error = form.formState.errors

  const debouncedCheckSlugAvailability = useDebouncedCallback(
    async (slug: string, currentChannelId?: string) => {
      if (!slug) {
        setSlugAvailableMessage("")
        form.clearErrors("channel_slug")
        return
      }
      try {
        // Only check if slug is different from the current selected channel's slug in edit mode
        if (
          isEditMode &&
          currentChannelId &&
          selectedChannel?.channel_slug === slug
        ) {
          setSlugAvailableMessage("") // No need to re-check if it's the original slug
          form.clearErrors("channel_slug")
          return
        }

        const result = await checkSlugAvailability(slug)

        if (result?.data) {
          form.clearErrors("channel_slug")
          setSlugAvailableMessage(`${slug} is available`)
        } else {
          form.setError("channel_slug", {
            type: "manual",
            message: `${slug} is already taken`
          })
          setSlugAvailableMessage("")
        }
      } catch (error) {
        console.error("Error checking slug availability:", error)
        setSlugAvailableMessage("")
      }
    },
    500 // Debounce delay in milliseconds
  )

  // Effect to handle form reset and data loading when dialog visibility or selected channel changes
  useEffect(() => {
    if (!channelFormModelVisibility) {
      form.reset()
      form.clearErrors()
      setSelectedChannel(null)
      setSlugAvailableMessage("")
    } else if (selectedChannel) {
      form.setValue("channel_name", selectedChannel.channel_name)
      form.setValue("description", selectedChannel.description || "")
      form.setValue("channel_type", selectedChannel.channel_type || "")
      form.setValue("publish_channel", selectedChannel.publish_channel === 1)
      form.setValue("channel_slug", selectedChannel.channel_slug || "")
      setSlugAvailableMessage("") // Clear message initially for edit mode
    }
  }, [channelFormModelVisibility, selectedChannel, form, setSelectedChannel])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "channel_name") {
        const channelName = value.channel_name || ""
        const generatedSlug = channelName
          .trim()
          .replaceAll(" ", "-")
          .toLowerCase()

        if (generatedSlug !== form.getValues("channel_slug") || !isEditMode) {
          form.setValue("channel_slug", generatedSlug)
        }

        if (
          generatedSlug &&
          (generatedSlug !== selectedChannel?.channel_slug || !isEditMode)
        ) {
          debouncedCheckSlugAvailability(generatedSlug, selectedChannel?.id)
        } else {
          setSlugAvailableMessage("")
          form.clearErrors("channel_slug")
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, debouncedCheckSlugAvailability, isEditMode, selectedChannel])

  async function channelSubmit(data: z.infer<typeof channelSchema>) {
    const publishValue = data.publish_channel ? 1 : 0

    if (!isEditMode) {
      await handleCreateChannel({
        ...data,
        created_by: authUser?.unique_id as string,
        publish_channel: publishValue
      })
    } else {
      await handleUpdateChannel({ ...data, publish_channel: publishValue })
    }
  }

  async function handleCreateChannel(data: InsertChannel) {
    if (!authUser?.unique_id || !communityId) {
      toast({
        title: "Error",
        description: "Missing user or community ID for channel creation.",
        variant: "destructive",
        duration: 3000
      })
      return
    }
    try {
      const payload: InsertChannel = {
        ...data,
        channel_name: data.channel_name.trim(),
        channel_slug: data.channel_slug?.trim() || "",
        created_by: authUser.unique_id,
        community_id: communityId
      }
      const createdChannel = await CreateChannel(payload)

      if (createdChannel?.success && createdChannel?.data) {
        await refreshAuthUser()
        onChannelCreated?.(createdChannel.data)
        setChannelFormModelVisibility(false)
        onActionComplete?.(createdChannel.data, "create")
        toast({
          title: "Channel Created",
          description: "Your channel has been created successfully.",
          duration: 3000
        })
      } else if (createdChannel?.error) {
        toast({
          title: "Channel Creation Failed",
          variant: "destructive",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: "Unable to create channel",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  async function handleUpdateChannel(updatedData: Partial<SelectChannel>) {
    if (!selectedChannel?.id) {
      toast({
        title: "Error",
        description: "No channel selected for update.",
        variant: "destructive",
        duration: 3000
      })
      return
    }
    try {
      const payload: Partial<SelectChannel> = {
        ...updatedData,
        channel_name: updatedData.channel_name?.trim() || "",
        channel_slug: updatedData.channel_slug?.trim() || ""
      }
      const updatedChannel = await UpdateChannel(selectedChannel.id, payload)
      if (updatedChannel?.success && updatedChannel.data) {
        setChannels((prev) =>
          prev.map((channel) =>
            channel.id === selectedChannel.id
              ? { ...channel, ...updatedChannel.data }
              : channel
          )
        )
        setChannelFormModelVisibility(false)
        onActionComplete?.(updatedChannel.data as SelectChannel, "update")
        toast({
          title: "Channel Updated",
          description: "Your channel has been updated successfully.",
          duration: 3000
        })
      } else if (updatedChannel?.error) {
        toast({
          title: "Channel Update Failed",
          variant: "destructive",
          duration: 3000
        })
      }
    } catch (error) {
      console.error("Failed to update channel:", error)
      toast({
        title: "Unable to update channel",
        description: "An unexpected error occurred.",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  return (
    <Dialog
      open={channelFormModelVisibility}
      onOpenChange={setChannelFormModelVisibility}
    >
      <DialogTrigger asChild>
        <Button>
          <CirclePlus className=" h-4 w-4" />
          Create Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Channel" : "Create Channel"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "You can edit your channel."
              : "You can create Channels."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(channelSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Label htmlFor="channel_name">Channel Name</Label>
                <div className="w-[70%]">
                  <Controller
                    name="channel_name"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input id="channel_name" {...field} />
                    )}
                  />
                </div>
              </div>
              <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                {error.channel_name && (
                  <span className="text-red-500 text-sm">
                    {String(error.channel_name.message)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Label htmlFor="channel_slug">Channel Slug</Label>
                <div className="w-[70%]">
                  <Controller
                    name="channel_slug"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input id="channel_slug" {...field} disabled={true} />
                    )}
                  />
                </div>
              </div>
              <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                {error.channel_slug && !isSlugAvailableLoading && (
                  <div className="flex items-center text-red-500">
                    <CircleXIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      {String(error.channel_slug.message)}
                    </span>
                  </div>
                )}
                {isSlugAvailableLoading && (
                  <>
                    <Loader size={LoaderSizes.sm} />
                    <span className="text-gray-500 text-sm">
                      checking slug availability
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
                      <Textarea id="description" {...field} />
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
                <Label htmlFor="channel_type">Channel type</Label>
                <div className="w-[70%]">
                  <Controller
                    name="channel_type"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                {error.channel_type && (
                  <span className="text-red-500 text-sm">
                    {String(error.channel_type.message)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="publish_channel">Publish Channel</Label>
              <div className="w-[70%]">
                <Controller
                  name="publish_channel"
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
          </div>
          <DialogFooter>
            <Button
              type="submit"
              loading={isEditMode ? addUpdateChannelLoading : addChannelLoading}
              disabled={!!error.channel_slug?.message}
            >
              {isEditMode ? "Save Changes" : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateChannels
