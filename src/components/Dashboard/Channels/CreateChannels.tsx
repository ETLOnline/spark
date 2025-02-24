import React, { Dispatch, SetStateAction, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { useAtomValue, useSetAtom } from 'jotai'
import { userStore } from '@/src/store/user/userStore'
import { InsertChannel, SelectChannel } from '@/src/db/schema'
import { useServerAction } from '@/src/hooks/useServerAction'
import { CreateChannelAction } from '@/src/server-actions/channels/channel'
import { useToast } from '@/src/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { channelStore } from '@/src/store/chennel/channelStore'

interface props {
  channel: SelectChannel[],
  setChannel: Dispatch<SetStateAction<SelectChannel[]>>
}

function CreateChannels({ channel, setChannel }: props) {
  const [newChannel, setNewChannel] = useState({
    channel_name: "",
    description: "",
    channel_type: "",
    created_by: "",
  });

  const [addchannelLoading, addchannelData, addchannelError, CreateChannel] = useServerAction(CreateChannelAction);
  const authUser = useAtomValue(userStore.AuthUser);
  const { toast } = useToast()
  const channelFormModelVisibility = useAtomValue(channelStore.channelformModalVisibility)
  const setChannelFormModelVisibility = useSetAtom(channelStore.channelformModalVisibility)





  const handleCreateChannel = async () => {
    try {
      const payLoad = { ...newChannel };
      payLoad.created_by = authUser?.unique_id || "";

      const createdChannel = await CreateChannel(payLoad as InsertChannel);
      if (createdChannel?.success && createdChannel?.data) {
        setChannel([...channel, ...createdChannel.data])

        setNewChannel({
          channel_name: "",
          description: "",
          channel_type: "",
          created_by: ""
        })
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



  return (
    <Dialog open={channelFormModelVisibility} onOpenChange={(open) => { setChannelFormModelVisibility(open) }}>
      <DialogTrigger>
        <Button variant={'default'}>
          Create Channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>You can create Channels.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor="channel_name">Channel Name</Label>
            <Input
              id="channel_name"
              placeholder='Enter channel name'
              value={newChannel.channel_name}
              onChange={(e) => setNewChannel({ ...newChannel, channel_name: e.target.value })}
              className="col-span-3"
            />
          </div>

          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder='Description...'
              value={newChannel.description}
              onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='channel_type'>Channel type</Label>
            <Select onValueChange={(value) => setNewChannel({ ...newChannel, channel_type: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select channel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='public'>Public</SelectItem>
                <SelectItem value='private'>Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            loading={addchannelLoading} onClick={handleCreateChannel}
            variant={'default'}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateChannels