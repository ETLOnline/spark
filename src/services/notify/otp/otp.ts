import { AddToQueue } from "../../queue/addToQueue"
import { NotificationEvent } from "../types/events"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"

export async function sendIdentityVerificationOtpEmail({
  to,
  userName,
  verificationEmail,
  otpCode,
  expiresInMinutes
}: {
  to: string
  userName: string
  verificationEmail: string
  otpCode: string
  expiresInMinutes: number
}) {
  console.log("Sending OTP email to:", to, "with code:", otpCode)
  await AddToQueue({
    sendingTo: [to],
    event: NotificationEvent.IDENTITY_VERIFICATION_OTP,
    payload: {
      logoUrl: getSiteLogoUrl(),
      userName,
      verificationEmail,
      otpCode,
      expiresInMinutes
    },
    withData: true
  })
}

export async function sendIdentityVerifiedEmail({
  to,
  userName,
  verifiedEmail
}: {
  to: string
  userName: string
  verifiedEmail: string
}) {
  await AddToQueue({
    sendingTo: [to],
    event: NotificationEvent.IDENTITY_VERIFIED,
    payload: {
      logoUrl: getSiteLogoUrl(),
      userName,
      verifiedEmail,
      ctaLink: createAbsoluteUrl("/profile")
    },
    withData: true
  })
}
