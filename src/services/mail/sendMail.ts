import sgMail from "@sendgrid/mail"

interface SendGridEmailPayload {
  to: string
  templateId: string
  dynamicTemplateData: any
}

export async function sendEmail(job: SendGridEmailPayload) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

  try {
    const msg = {
      to: job.to,
      from: process.env.SENDGRID_FROM_EMAIL as string,
      templateId: job.templateId,
      dynamicTemplateData: job.dynamicTemplateData,
      subject: "Task Update"
    }

    await sgMail.send(msg)

    console.log(
      `Email successfully sent to ${job.to} via SendGrid Dynamic Template`
    )
  } catch (error: any) {
    console.error(`Failed to send dynamic email to ${job.to}:`, error)

    if (error.response) {
      console.error(error.response.body)
    }
    throw error
  }
}
