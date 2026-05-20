"use server"

import { CreateContactUs } from "@/src/db/data-access/contact-us/query"

export async function SubmitContactUsAction(data: {
  name: string
  email: string
  subject: string
  description: string
}) {
  try {
    const contact = await CreateContactUs({
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description
    })

    return { success: true, contact }
  } catch (error: any) {
    console.error("Error submitting contact us:", error)
    throw new Error(error.message || "Failed to submit contact request")
  }
}
