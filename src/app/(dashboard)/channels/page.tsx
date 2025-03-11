import ChannelsScreen from "@/src/components/Dashboard/Channels"
import { SelectChannel } from "@/src/db/schema"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"

async function ChannelPage() {
  let channels: SelectChannel[] = []

  try {
    const res = await GetChannelsAction()
    if (res?.success) {
      channels = res.data
    }
  } catch (error) {
    console.error("Error fetching spaces!", error)
  }

  return <ChannelsScreen fetchedChannels={channels} />
}

export default ChannelPage
export const dynamic = "force-dynamic"
