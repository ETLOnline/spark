"use server"

import { POST } from "@/src/app/api/queues/email/route"
import { CreateServerAction } from ".."

export const enqueueTaskUpdateEmailAction = CreateServerAction(
  true,
  async (to: string, dynamicTemplateData: any) => {
    try {
      await POST.enqueue(
        { to, dynamicTemplateData, template_name: "update_task" },
        { delay: "1m" }
      )
      return {
        success: true,
        message: "Update Task email enqueued successfully!"
      }
    } catch (error) {
      console.error(`Error enqueuing Update Task email for ${to}:`, error)
      return {
        success: false,
        message: `Failed to enqueue Update Task email: ${
          error instanceof Error ? error.message : String(error)
        }`
      }
    }
  }
)
