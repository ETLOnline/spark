import CreateChannels from "@/src/components/Dashboard/Channels/CreateChannels"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import ChannelsCards from "@/src/components/Dashboard/Channels/ChannelsCards"

const ChannelsPage: React.FC = async () => {
  const userRole = (await AuthUserAction())?.role
  const result = (await GetChannelsAction({ page: 1, limit: 3 })).data

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold sm:text-2xl">Channels</h2>
        {userRole?.includes("admin") ? <CreateChannels /> : null}
      </div>
      {!result?.channels || result.channels.length === 0 ? (
        <NoDataCard title="No channels available" />
      ) : (
        <ChannelsCards
          fetchedChannels={result.channels}
          pagination={result.pagination}
        />
      )}
    </div>
  )
}

export default ChannelsPage
