import { SelectUser } from "@/src/db/schema"
import { AddToQueue } from "../../queue/addToQueue"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"
import { prepareContactData } from "@/src/utils/helpers"

export async function createContactNotification(
  event: string,
  createdByUser: SelectUser,
  receivedBy: string
) {
  const contactData = await prepareContactData(createdByUser, receivedBy, event)
  if (!contactData) {
    return
  }
  const { payload, sendingTo } = contactData
  await AddToQueue({
    sendingTo,
    event,
    payload,
    withData: true
  })
}
