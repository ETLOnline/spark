import ChannelDetails from "@/src/components/Dashboard/Channels/ChannelDetails"
import { SelectSpace } from "@/src/db/schema"
import { GetSpacesAction } from "@/src/server-actions/Spaces/space"

async function ChannelPage({
  searchParams
}: {
  searchParams: { channel_id: string }
}) {
  let spaces: SelectSpace[] = []

  try {
    const res = await GetSpacesAction(searchParams.channel_id)
    if (res?.success) {
      spaces = res.data
    }
  } catch (error) {
    console.error("Error fetching spaces!", error)
  }

  return <ChannelDetails fetchedSpaces={spaces} />
}

export default ChannelPage
