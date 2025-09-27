import { AddToQueue } from "../../queue/addToQueue"
import { getBulkUsers } from "@/src/db/data-access/user/query"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"
import { GetSpaceById } from "@/src/db/data-access/spaces/query"

export async function createChatEmailNotification(
  event: string,
  users_ids: string[],
  space_id: string
) {
  const authUser = await AuthUserAction()
  if (!authUser) throw new Error("Unauthorized")
  const BulkUsers = await getBulkUsers(users_ids)
  let linkUrl = "/chat"
  if (space_id) {
    const space = await GetSpaceById(space_id)
    linkUrl = `/channels/${space?.channel.channel_slug}/spaces/${space?.space_slug}?page-type=chat`
  }
  const sendingTo = [
    ...new Set(
      BulkUsers.filter((user) => user.email !== authUser.email).map(
        (user) => user.email
      )
    )
  ]
  const chatType = sendingTo.length > 1 ? "a group chat" : "a private chat"
  const logoUrl = getSiteLogoUrl()
  const linkPath = createAbsoluteUrl(linkUrl)
  const payload = {
    logoUrl: logoUrl,
    subject: "You've got a new chat",
    inviterName: `${authUser.first_name} ${authUser.last_name}`,
    chatType: chatType,
    ctaLink: linkPath
  }

  await AddToQueue({
    sendingTo,
    event,
    payload,
    withData: true
  })
}
