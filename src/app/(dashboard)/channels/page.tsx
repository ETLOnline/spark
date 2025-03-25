import CreateChannels from "@/src/components/Dashboard/Channels/CreateChannels"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import ChannelsCards from "@/src/components/Dashboard/Channels/ChannelsCards"
import { SelectChannel } from "@/src/db/schema"

const ChannelsPage: React.FC = async () => {
  const userRole = (await AuthUserAction())?.role
  const channels = (await GetChannelsAction()).data

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold sm:text-2xl">Channels</h2>
        {userRole?.includes("admin") ? <CreateChannels /> : null}
      </div>
      {!channels || channels?.length === 0 ? (
        <NoDataCard title="No channels available" />
      ) : (
        <ChannelsCards fetchedChannels={channels as SelectChannel[]} />
      )}
    </div>
  )
}

export default ChannelsPage
