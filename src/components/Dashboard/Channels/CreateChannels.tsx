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
import { useAtom, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { InsertChannel, SelectChannel } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateChannelAction,
  DeleteChannelAction,
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
import { CircleCheck, CircleXIcon, Plus } from "lucide-react"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/Loader/types/loader-types"

const channelSchema = z.object({
  channel_name: z
    .string()
    .min(1, "Title required")
    .max(30, "Title is too long"),
  description: z
    .string()
    .min(1, "description required")
    .max(50, "Description is too long"),
  channel_type: z.string().min(1, " Channel type required"),
  channel_slug: z.string().max(15, "Slug is too long")
})

function CreateChannels() {
  const [editChannel, setEditChannel] = useState<boolean>(false)
  const [slugAvailableMessage, setslugAvailableMessage] = useState<string>("")

  const timeoutId = useRef<NodeJS.Timeout>(null)

  const [channels, setChannels] = useAtom(channelStore.channels)
  const [channelFormModelVisibility, setChannelFormModelVisibility] = useAtom(
    channelStore.channelformModalVisibility
  )

  const authUser = useAtomValue(userStore.AuthUser)
  const selectedChannel = useAtomValue(channelStore.selectedChannel)

  const [addChannelLoading, addChannelData, addChannelError, CreateChannel] =
    useServerAction(CreateChannelAction)
  const [
    addUpdateChannelLoading,
    addUpdateChannelData,
    addUpdateChannelError,
    UpdateChannel
  ] = useServerAction(UpdateChannelAction)
  const [
    addDeleteChannelLoading,
    addDeleteChannelData,
    addDeleteChannelError,
    DeleteChannel
  ] = useServerAction(DeleteChannelAction)
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
  }, [channelFormModelVisibility])

  useEffect(() => {
    if (selectedChannel) {
      form.setValue("channel_name", selectedChannel.channel_name)
      form.setValue("description", selectedChannel.description as string)
      form.setValue("channel_type", selectedChannel.channel_type as string)
    }
  }, [selectedChannel])

  useEffect(() => {
    const value = form.getValues("channel_name")

    if (value) {
      checkSlugAvailability(value + form.getValues("channel_slug"))
    }
  }, [form.watch("channel_name")])

  useEffect(() => {
    const value = form.getValues("channel_slug")

    if (value) {
      checkSlugAvailability(form.getValues("channel_name") + value)
    }
  }, [form.watch("channel_slug")])

  async function channelSubmit(data: any) {
    if (!selectedChannel) {
      handleCreateChannel(data)
    }
    if (selectedChannel) {
      handleUpdateChannel(data)
    }
  }

  async function handleCreateChannel(data: InsertChannel) {
    try {
      const payLoad = {
        ...data,
        channel_slug: data.channel_name + data.channel_slug
      }
      payLoad.created_by = authUser?.unique_id as string

      const createdChannel = await CreateChannel(payLoad as InsertChannel)
      if (createdChannel?.success && createdChannel?.data) {
        setChannels([...channels, ...createdChannel.data])
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
      if (!selectedChannel?.id) return
      const updatedChannel = await UpdateChannel(
        selectedChannel.id,
        updatedData
      )
      if (updatedChannel?.success && updatedChannel.data)
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
        duration: 3000
      })
    } catch {
      toast({
        title: "Unable to update channel",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  async function handleDeleteChannel() {
    const deletedChannel = await DeleteChannel(selectedChannel as SelectChannel)
    if (deletedChannel?.success) {
      setChannels((channel) =>
        channel.filter((channel) => channel.id !== selectedChannel?.id)
      )
      setChannelFormModelVisibility(false)
    }
  }

  const checkSlugAvailability = async (slug: string) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    timeoutId.current = setTimeout(async () => {
      const result = await isSlugAvailable(slug)
      if (result?.success) {
        if (!result?.data) {
          form.setError("channel_slug", {
            type: "manual",
            message: `the slug, ${slug} is already taken`
          })
          setslugAvailableMessage("")
        } else {
          form.clearErrors("channel_slug")
          setslugAvailableMessage(`the slug, ${slug} is available`)
        }
      }
    }, 2500)
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
          <Plus className="mr-2 h-4 w-4" />
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
              <div className="text-left">
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
                      {error.channel_slug.message}
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
              <div className="text-left">
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
              <div className="text-left">
                {error.channel_type && (
                  <span className="text-red-500 text-sm">
                    {String(error.channel_type.message)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            {editChannel === true ? (
              <div className="w-full flex justify-between">
                <Button
                  variant="destructive"
                  type="button"
                  onClick={handleDeleteChannel}
                  loading={addDeleteChannelLoading}
                >
                  Delete
                </Button>
                <Button type="submit" loading={addUpdateChannelLoading}>
                  Save
                </Button>
              </div>
            ) : (
              <Button type="submit" loading={addChannelLoading}>
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
