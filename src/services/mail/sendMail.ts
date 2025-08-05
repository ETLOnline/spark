import nodemailer from "nodemailer"

interface EmailJobPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(job: EmailJobPayload) {
  const transporter = nodemailer.createTransport({
    host: process.env.SENDGRID_SMTP_HOST || "smtp.sendgrid.net",
    port: parseInt(process.env.SENDGRID_SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SENDGRID_SMTP_USER || "apikey",
      pass: process.env.SENDGRID_SMTP_PASS
    }
  })

  try {
    await transporter.sendMail({
      from: process.env.SENDGRID_FROM_EMAIL,
      to: job.to,
      subject: job.subject,
      html: job.html
    })
    console.log(
      `Email successfully sent to ${job.to}: ${job.subject} via SendGrid`
    )
  } catch (error) {
    console.error(`Failed to send email to ${job.to} via SendGrid:`, error)
    throw error
  }
}
