"use client"

import { useEffect, useState } from "react"
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
import { InsertChannel, SelectChannel, SelectCommunity } from "@/src/db/schema"
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
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { CommunityDetailData } from "@/src/db/data-access/communities/query"
import { slugify } from "@/src/utils/helpers"
import { ScrollArea } from "../../ui/scroll-area"
import { UnsavedChangesDialog } from "../../common/unsavedChangesDialog"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"

const channelSchema = z.object({
  channel_name: z
    .string()
    .min(1, "Channel name required")
    .max(50, "Channel name is too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(150, "Description is too long"),
  channel_type: z.string().min(1, "Channel type required"),
  channel_slug: z.string().max(50, "Slug is too long"),
  publish_channel: z.boolean().optional(),
  community_id: z.string().min(1, "Community ID is required")
})

type CreateChannelsProps = {
  onChannelCreated?: (newChannel: SelectChannel) => void
  onActionComplete?: (
    actionType: "create" | "updated",
    channel: SelectChannel
  ) => void
  community?: CommunityDetailData
}

function CreateChannels({
  onChannelCreated,
  onActionComplete,
  community
}: CreateChannelsProps) {
  const { refreshAuthUser, isReloadingPermissions } = useAuthUser()
  const [editChannel, setEditChannel] = useState<boolean>(false)
  const [slugAvailableMessage, setSlugAvailableMessage] = useState<string>("")

  const [channels, setChannels] = useAtom(channelStore.channels)
  const authUser = useAtomValue(userStore.AuthUser)
  const [channelFormModelVisibility, setChannelFormModelVisibility] = useAtom(
    channelStore.channelformModalVisibility
  )
  const [selectedChannel, setSelectedChannel] = useAtom(
    channelStore.selectedChannel
  )

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
    resolver: zodResolver(channelSchema),
    defaultValues: {
      channel_name: "",
      description: "",
      channel_type: "",
      channel_slug: "",
      publish_channel: false,
      community_id: community?.id || ""
    }
  })

  const error = form.formState.errors
  const isChange = form.formState.isDirty

  const debouncedCheckSlugAvailability = useDebouncedCallback(
    async (slug: string, currentChannelId?: string) => {
      if (!slug) {
        setSlugAvailableMessage("")
        form.clearErrors("channel_slug")
        return
      }

      if (
        editChannel &&
        currentChannelId &&
        selectedChannel?.id === currentChannelId &&
        selectedChannel?.channel_slug === slug
      ) {
        setSlugAvailableMessage(`${slug} is available`)
        form.clearErrors("channel_slug")
        return
      }

      try {
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
        form.setError("channel_slug", {
          type: "manual",
          message: `Failed to check slug availability`
        })
        setSlugAvailableMessage("")
      }
    },
    500
  )

  useEffect(() => {
    setEditChannel(selectedChannel != null)
  }, [selectedChannel])

  useEffect(() => {
    form.reset({
      channel_name: "",
      description: "",
      channel_type: "",
      channel_slug: "",
      publish_channel: false,
      community_id: community?.id || ""
    })
    if (!channelFormModelVisibility) {
      setSelectedChannel(null)
    }
    form.clearErrors()
    setSlugAvailableMessage("")
  }, [channelFormModelVisibility, form, setSelectedChannel, community?.id])

  useEffect(() => {
    if (selectedChannel) {
      form.setValue("channel_name", selectedChannel.channel_name)
      form.setValue("description", selectedChannel.description as string)
      form.setValue("channel_type", selectedChannel.channel_type as string)
      form.setValue("publish_channel", selectedChannel.publish_channel === 1)
      form.setValue(
        "community_id",
        selectedChannel.community_id || community?.id || ""
      )

      form.setValue("channel_slug", selectedChannel.channel_slug)

      debouncedCheckSlugAvailability(
        selectedChannel.channel_slug,
        selectedChannel.id
      )
    }
  }, [selectedChannel, form, community?.id, debouncedCheckSlugAvailability])

  const handleChannelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const channelName = e.target.value

    form.setValue("channel_name", channelName, {
      shouldValidate: true,
      shouldDirty: true
    })

    const channelSlug = channelName.trim().replaceAll(" ", "-").toLowerCase()

    const slug = `${community?.slug}-${channelSlug}`.trim()

    const generatedSlug = slugify(slug)

    form.setValue("channel_slug", generatedSlug, {
      shouldValidate: true,
      shouldDirty: true
    })

    if (generatedSlug) {
      debouncedCheckSlugAvailability(generatedSlug, selectedChannel?.id)
    } else {
      setSlugAvailableMessage("")
      form.clearErrors("channel_slug")
    }
  }

  async function channelSubmit(data: any) {
    if (data.publish_channel === true) {
      data.publish_channel = 1
    } else {
      data.publish_channel = 0
    }
    if (!selectedChannel) {
      await handleCreateChannel(data)
    }
    if (selectedChannel) {
      await handleUpdateChannel(data)
    }
  }

  async function handleCreateChannel(data: InsertChannel) {
    try {
      const payLoad = {
        ...data,
        channel_name: data.channel_name.trim(),
        channel_slug: data.channel_slug,
        created_by: authUser?.unique_id as string,
        community_id: data.community_id
      }
      const createdChannel = await CreateChannel(payLoad as InsertChannel)

      if (createdChannel?.success && createdChannel?.data) {
        await refreshAuthUser()
        onChannelCreated?.(createdChannel.data as SelectChannel)
        onActionComplete?.("create", createdChannel.data as SelectChannel)
        setChannelFormModelVisibility(false)
        toast({
          title: "Channel Created",
          description: "Your channel has been created successfully",
          duration: 3000
        })
      }
    } catch (error) {
      console.error("Error creating channel:", error)
      toast({
        title: "Unable to created channel",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  async function handleUpdateChannel(updatedData: Partial<SelectChannel>) {
    try {
      const payLoad = {
        ...updatedData,
        channel_name: updatedData?.channel_name?.trim() || "",

        channel_slug: form.getValues("channel_slug"),
        community_id: updatedData?.community_id
      }
      if (!selectedChannel?.id) return
      const updatedChannel = await UpdateChannel(selectedChannel.id, payLoad)
      if (
        updatedChannel?.success &&
        updatedChannel.data &&
        !(updatedChannel.data instanceof Error)
      ) {
        setChannelFormModelVisibility(false)
        onActionComplete?.("updated", updatedChannel.data as SelectChannel)
        toast({
          title: "Channel updated",
          description: "Your channel successfully updated.",
          duration: 300
        })
      }
    } catch (error) {
      console.error("Error updating channel:", error)
      toast({
        title: "Unable to update channel",
        variant: "destructive",
        duration: 3000
      })
    }
  }
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    community?.id
  )
  const canCreteChannel = permissionChecker
    ? permissionChecker.canAccess("community.channel.create")
    : false

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: isChange,
      onClose: () => setChannelFormModelVisibility(false)
    })

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setChannelFormModelVisibility(true)
    } else {
      handleClose(false)
    }
  }

  return (
    <>
      <Dialog
        open={channelFormModelVisibility}
        onOpenChange={handleDialogChange}
      >
        <DialogTrigger asChild>
          {canCreteChannel && (
            <Button>
              <CirclePlus className=" h-4 w-4" />
              Create Channel
            </Button>
          )}
        </DialogTrigger>
        <DialogContent
          className="max-w-[95vw] sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-3">
            <DialogTitle>
              {editChannel === true ? "Edit Channel" : "Create Channel"}
            </DialogTitle>
            <DialogDescription>
              {editChannel === true
                ? "You can edit your channel."
                : "You can create Channels."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[80vh] w-full p-3">
            <form onSubmit={form.handleSubmit(channelSubmit)}>
              <div className="grid gap-4 py-4">
                {/* Channel Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="channel_name">Channel Name</Label>
                  <Controller
                    name="channel_name"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="channel_name"
                        {...field}
                        onChange={(e) => {
                          handleChannelNameChange(e)
                        }}
                        placeholder="Enter channel name"
                      />
                    )}
                  />
                  {error.channel_name && (
                    <span className="text-red-500 text-sm">
                      {String(error.channel_name.message)}
                    </span>
                  )}
                </div>

                {/* Channel Slug */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="channel_slug">Channel Slug</Label>
                  <Controller
                    name="channel_slug"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="channel_slug"
                        {...field}
                        disabled={true}
                        placeholder="channel_slug"
                      />
                    )}
                  />
                  {error.channel_slug && !isSlugAvailableLoading && (
                    <div className="flex items-center text-red-500 gap-x-2 pt-1">
                      <CircleXIcon className="mr-2 h-4 w-4" />
                      <span className="text-sm">
                        {String(error.channel_slug.message)}
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
                      <CircleCheck className="mr-2 h-4 w-4" />
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
                            {...field}
                            maxLength={maxChars}
                            placeholder="Description"
                          />
                          <div className="text-sm flex justify-between items-center text-muted-foreground mt-1">
                            {error.description && (
                              <span className="text-red-500 text-sm">
                                {String(error.description.message)}
                              </span>
                            )}
                            <span className="ml-auto">
                              {charCount}/{maxChars} characters
                            </span>
                          </div>
                        </>
                      )
                    }}
                  />
                </div>

                {/* Channel Type */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="channel_type">Channel Type</Label>
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
                  {error.channel_type && (
                    <span className="text-red-500 text-sm">
                      {String(error.channel_type.message)}
                    </span>
                  )}
                </div>

                {/* Publish Channel */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="publish_channel">Publish Channel</Label>
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

                {/* HIDDEN COMMUNITY_ID FIELD */}
                <Controller
                  name="community_id"
                  control={form.control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />
              </div>
              <DialogFooter>
                {editChannel === true ? (
                  <Button type="submit" loading={addUpdateChannelLoading}>
                    Save
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={addChannelLoading}
                    disabled={
                      error.channel_slug?.message
                        ? true
                        : false || addChannelLoading || isSlugAvailableLoading
                    }
                  >
                    Create
                  </Button>
                )}
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={setChannelFormModelVisibility}
      />
    </>
  )
}

export default CreateChannels
