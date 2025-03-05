"use client"
import React, { useEffect, useState } from "react"
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
  DeleteChannelAction,
  UpdateChannelAction
} from "@/src/server-actions/channels/channel"
import { useToast } from "@/src/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select"
import { channelStore } from "@/src/store/chennel/channelStore"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const channelSchema = z.object({
  channel_name: z
    .string()
    .min(1, "Tilte required")
    .max(30, "Tilte is too long"),
  description: z
    .string()
    .min(1, "description required")
    .max(50, "Description is too long"),
  channel_type: z.string().min(1, " Channel type required")
})

function CreateChannels() {
  const [channels, setChannels] = useAtom(channelStore.channels)
  const [editChannal, setEditChannel] = useState(false)
  const selectedChannel = useAtomValue(channelStore.selectedChannel)
  const [channelFormModelVisibility, setChannelFormModelVisibility] = useAtom(
    channelStore.channelformModalVisibility
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
    addDeleteChannelLoading,
    addDeleteChannelData,
    addDeleteChannelError,
    DeleteChannel
  ] = useServerAction(DeleteChannelAction)
  const authUser = useAtomValue(userStore.AuthUser)
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

  async function channelSubmit(data: any) {
    if (!selectedChannel) {
      handleCreateChannel(data)
    }
    if (selectedChannel) {
      handleUpdateChannel(data)
    }
  }

  async function handleCreateChannel(data: any) {
    try {
      const payLoad = { ...data }
      payLoad.created_by = authUser?.unique_id

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

  return (
    <Dialog
      open={channelFormModelVisibility}
      onOpenChange={(open) => {
        setChannelFormModelVisibility(open)
      }}
    >
      <DialogTrigger>
        <Button>Create Channel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editChannal === true ? "Edit Channel" : "Create Channel"}
          </DialogTitle>
          <DialogDescription>
            {editChannal === true
              ? "You can edit your channel."
              : "You can create Channels."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(channelSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="channel_name">Channel Name</Label>
                <Controller
                  name="channel_name"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="channel_name"
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
                {error.channel_name && (
                  <span className="text-red-500 text-sm">
                    {String(error.channel_name.message)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
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
            <div className="flex flex-col">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="channel_type">Channel type</Label>
                <Controller
                  name="channel_type"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="col-span-3">
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
            <div className="text-right">
              {error.channel_type && (
                <span className="text-red-500 text-sm">
                  {String(error.channel_type.message)}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            {editChannal === true ? (
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
