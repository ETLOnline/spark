"use client"

import React, { useEffect, useRef, useState } from "react"
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
import { useAtom, useAtomValue, useSetAtom } from "jotai"
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
import { LoaderSizes } from "../../common/Loader/types/loader-types"
import { Switch } from "../../ui/switch"
import { checkSlugAvailability } from "@/src/utils/helpers"

const channelSchema = z.object({
  channel_name: z
    .string()
    .min(1, "Title required")
    .max(30, "Title is too long"),
  description: z
    .string()
    .min(1, "description required")
    .max(100, "Description is too long"),
  channel_type: z.string().min(1, " Channel type required"),
  channel_slug: z.string().max(15, "Slug is too long"),
  publish_channel: z.boolean().optional()
})

function CreateChannels() {
  const [editChannel, setEditChannel] = useState<boolean>(false)
  const [slugAvailableMessage, setslugAvailableMessage] = useState<string>("")

  const timeoutId = useRef<NodeJS.Timeout>(null)

  const setChannels = useSetAtom(channelStore.channels)
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
    isSlugAvailable
  ] = useServerAction(IsSlugAvailableAction)

  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(channelSchema)
  })

  const error = form.formState.errors

  useEffect(() => {
    if (selectedChannel != null) {
      setEditChannel(true)
    } else {
      setEditChannel(false)
    }
  }, [selectedChannel])

  useEffect(() => {
    form.reset()
    if (!channelFormModelVisibility) {
      setSelectedChannel(null)
    }
    form.clearErrors()
  }, [channelFormModelVisibility])

  useEffect(() => {
    if (!channelFormModelVisibility) {
      // Reset all form fields
      form.reset({
        channel_name: "",
        channel_slug: "",
        description: "",
        channel_type: ""
      })
      // Clear any errors
      form.clearErrors()
      // Reset other state
      setSelectedChannel(null)
      setEditChannel(false)
      setslugAvailableMessage("")
    }
  }, [channelFormModelVisibility])

  useEffect(() => {
    if (selectedChannel) {
      form.setValue("channel_name", selectedChannel.channel_name)
      form.setValue("description", selectedChannel.description as string)
      form.setValue("channel_type", selectedChannel.channel_type as string)
      if (selectedChannel.publish_channel === 1) {
        form.setValue("publish_channel", true)
      } else {
        form.setValue("publish_channel", false)
      }
    }
  }, [selectedChannel])

  useEffect(() => {
    const value = form.getValues("channel_name").trim()
    const slug = `${value}${form.getValues("channel_slug").trim()}`

    if (value) {
      ;(async () => {
        timeoutId.current = await checkSlugAvailability(
          slug,
          timeoutId.current,
          async () => (await isSlugAvailable(slug))?.data,
          setslugAvailableMessage,
          () =>
            form.setError("channel_slug", {
              type: "manual",
              message: `the slug, ${slug
                .replaceAll(" ", "-")
                .toLowerCase()} is already taken`
            }),
          () => form.clearErrors("channel_slug")
        )
      })()
    }
  }, [form.watch("channel_name")])

  useEffect(() => {
    const value = form.getValues("channel_slug").trim()
    const slug = `${form.getValues("channel_name").trim()}${value}`

    if (value) {
      ;(async () => {
        timeoutId.current = await checkSlugAvailability(
          slug,
          timeoutId.current,
          async () => (await isSlugAvailable(slug))?.data,
          setslugAvailableMessage,
          () =>
            form.setError("channel_slug", {
              type: "manual",
              message: `the slug, ${slug
                .replaceAll(" ", "-")
                .toLowerCase()} is already taken`
            }),
          () => form.clearErrors("channel_slug")
        )
      })()
    }
  }, [form.watch("channel_slug")])

  async function channelSubmit(data: any) {
    if (!selectedChannel) {
      handleCreateChannel(data)
    }
    if (selectedChannel) {
      if (data.publish_channel === true) {
        data.publish_channel = 1
      } else {
        data.publish_channel = 0
      }
      handleUpdateChannel(data)
    }
  }

  async function handleCreateChannel(data: InsertChannel) {
    try {
      const payLoad = {
        ...data,
        channel_name: data.channel_name.trim(),
        channel_slug: `${data.channel_name}${data.channel_slug.trim()}`
          .replaceAll(" ", "-")
          .toLowerCase(),
        created_by: authUser?.unique_id as string
      }
      const createdChannel = await CreateChannel(payLoad as InsertChannel)

      if (createdChannel?.success && createdChannel?.data) {
        setChannelFormModelVisibility(false)
        toast({
          title: "Channel Created",
          description: "Your channel has been created successfully",
          duration: 3000
        })
      }
    } catch {
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
        channel_slug: `${updatedData.channel_name}${
          updatedData?.channel_slug?.trim() || ""
        }`
          .replaceAll(" ", "-")
          .toLowerCase()
      }
      if (!selectedChannel?.id) return
      const updatedChannel = await UpdateChannel(selectedChannel.id, payLoad)
      if (updatedChannel?.success && updatedChannel.data) {
        setChannels((channel) =>
          channel.map((channel) =>
            channel.id === selectedChannel.id
              ? { ...channel, ...updatedChannel.data }
              : channel
          )
        )
        setChannelFormModelVisibility(false)
        toast({
          title: "Channel updated",
          description: "Your channel successfully updated.",
          duration: 300
        })
      }
    } catch {
      toast({
        title: "Unable to update channel",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  return (
    <Dialog
      open={channelFormModelVisibility}
      onOpenChange={(open) => {
        setChannelFormModelVisibility(open)
      }}
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
            {editChannel === true ? "Edit Channel" : "Create Channel"}
          </DialogTitle>
          <DialogDescription>
            {editChannel === true
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
                      <Input
                        id="channel_slug"
                        {...field}
                        disabled={!form.getValues("channel_name")}
                        variant="resistive"
                        prefix={form.getValues("channel_name")}
                      />
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
            {editChannel === true && (
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
            )}
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
                disabled={error.channel_slug?.message ? true : false}
              >
                Create
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateChannels
