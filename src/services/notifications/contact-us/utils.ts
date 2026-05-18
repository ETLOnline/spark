import {
  notifyUserContactUsSubmitted,
  notifyAdminNewContactUs
} from "@/src/services/notify/contact-us/contact-us"

export const SendContactUsNotification = async (data: any) => {
  try {
    const submittedAt = new Date().toLocaleString()

    await notifyUserContactUsSubmitted("contact_us_submitted", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      submittedAt
    })

    // Send notification to all super admins via queue
    await notifyAdminNewContactUs("new_contact_us_admin", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      submittedAt
    })
  } catch (error) {
    console.error("Error sending contact us notification:", error)
  }
}
