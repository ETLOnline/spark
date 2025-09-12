"use server"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { AddToQueue } from "../../queue/addToQueue"
import { SelectTask } from "@/src/db/schema"
import { prepareTaskEmailData } from "@/src/utils/clientHelper"

export async function createTaskNotification(
  event: string,
  updatedTask: SelectTask,
  oldTask: SelectTask
) {
  const authUser = await AuthUserAction()
  const payload = prepareTaskEmailData(updatedTask, oldTask)

  const emailRecipients: string[] = []

  if (
    updatedTask?.assignee?.unique_id &&
    updatedTask.assignee.unique_id !== authUser?.unique_id
  ) {
    emailRecipients.push(updatedTask.assignee.email)
  }

  if (
    updatedTask?.assignor?.unique_id &&
    updatedTask.assignor.unique_id !== authUser?.unique_id
  ) {
    emailRecipients.push(updatedTask.assignor.email)
  }

  const sendingTo = [...new Set(emailRecipients)]

  await AddToQueue({
    sendingTo,
    event,
    payload,
    withData: true
  })
}
