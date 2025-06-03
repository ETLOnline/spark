import CreateChannels from "@/src/components/Dashboard/Channels/CreateChannels"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import ChannelCardList from "@/src/components/Dashboard/Channels/ChannelCardList"
import { isUserAdmin } from "@/src/utils/helpers"

interface Props {
  searchParams: Promise<{
    page?: number
  }>
}

const ChannelsPage = async ({ searchParams }: Props) => {
  const { page } = await searchParams
  const authUser = await AuthUserAction()

  const isAdmin = isUserAdmin(authUser)

  const channelsRes = await GetChannelsAction({
    page: page ? page : 1,
    limit: 6
  })
  const channels = channelsRes.data
  const joinedChannels = channelsRes.joinedChannels

  return (
    <>
      {joinedChannels && joinedChannels.length > 0 ? (
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold sm:text-2xl">Joined Channels</h2>
          </div>

          <ChannelCardList fetchedChannels={joinedChannels} />
        </div>
      ) : null}
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold sm:text-2xl">Channels</h2>
          {isAdmin ? <CreateChannels /> : null}
        </div>
        {!channels?.channels || channels.channels.length === 0 ? (
          <NoDataCard title="No channels available" />
        ) : (
          <ChannelCardList
            fetchedChannels={channels.channels}
            pagination={channels.pagination}
            withGlobalStore={true}
          />
        )}
      </div>
    </>
  )
}

export default ChannelsPage
