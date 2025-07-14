import { SelectChannel, SelectUser } from "../db/schema"
import { AttachChannelUserAction } from "../server-actions/Channel/Channel"
import { useServerAction } from "./useServerAction"

export function useChannelJoin(
  channel: SelectChannel | null,
  authUser: SelectUser | null,
  isMember: boolean
) {
  const [joinLoading, joinResult, joinError, joinChannel] = useServerAction(
    AttachChannelUserAction
  )

  async function handleJoinChannel() {
    if (
      channel?.channel_type === "public" &&
      !isMember &&
      channel?.id &&
      authUser?.unique_id
    ) {
      const res = await joinChannel(channel.id, authUser.unique_id)
      if (res?.success) return res
      return { success: false, error: res?.error }
    }
  }

  return {
    joinLoading,
    joinResult,
    joinError,
    handleJoinChannel
  }
}
