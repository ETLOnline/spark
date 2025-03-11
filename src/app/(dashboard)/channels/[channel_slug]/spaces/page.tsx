import ChannelDetails from "@/src/components/Dashboard/Channels/ChannelDetails"
import { SelectSpace } from "@/src/db/schema"
import { GetSpacesBySlugAction } from "@/src/server-actions/Space/Space"

async function ChannelPage(props: {
  params: Promise<{ channel_slug: string }>
}) {
  const { channel_slug } = await props.params

  let spaces: SelectSpace[] = []

  try {
    const res = await GetSpacesBySlugAction(channel_slug)
    if (res?.success) {
      spaces = res.data
    }
  } catch (error) {
    console.error("Error fetching spaces!", error)
  }

  return <ChannelDetails fetchedSpaces={spaces} />
}

export default ChannelPage
