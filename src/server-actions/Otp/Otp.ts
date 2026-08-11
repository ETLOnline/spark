"use server"

import { CreateServerAction } from ".."
import {
  CreateOrReplaceOtp,
  GetOtpByEmail,
  VerifyAndConsumeOtp
} from "@/src/db/data-access/otp/query"
import { updateUserProfile } from "@/src/db/data-access/profile/query"
import { SelectUserByUniqueId } from "@/src/db/data-access/user/query"
import {
  sendIdentityVerificationOtpEmail,
  sendIdentityVerifiedEmail
} from "@/src/services/notify/otp/otp"

const OTP_TTL_MINUTES = 5

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getUserDisplayName(user: {
  first_name?: string | null
  last_name?: string | null
}) {
  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "there"
}

export const SendEmailOtpAction = CreateServerAction(
  true,
  async (email: string, userId: string) => {
    try {
      const otp = generateOtp()
      const expiresAt = new Date(
        Date.now() + OTP_TTL_MINUTES * 60 * 1000
      ).toISOString()

      const record = await CreateOrReplaceOtp(email, otp, expiresAt)

      const user = await SelectUserByUniqueId(userId)
      await sendIdentityVerificationOtpEmail({
        to: email,
        userName: user ? getUserDisplayName(user) : "there",
        verificationEmail: email,
        otpCode: otp,
        expiresInMinutes: OTP_TTL_MINUTES
      })

      return { success: true, data: record }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetEmailOtpStatusAction = CreateServerAction(
  true,
  async (email: string) => {
    try {
      const record = await GetOtpByEmail(email)
      if (!record) return { success: true, data: null }

      return {
        success: true,
        data: { email: record.email, expires_at: record.expires_at }
      }
    } catch (error) {
      return { error: error }
    }
  }
)

export const VerifyEmailOtpAction = CreateServerAction(
  true,
  async (userId: string, email: string, otp: string) => {
    try {
      const matched = await VerifyAndConsumeOtp(email, otp)
      if (!matched) {
        return { success: false, error: "Invalid code" }
      }

      const profile = await updateUserProfile(userId, {
        email,
        verified: true
      })

      const user = await SelectUserByUniqueId(userId)
      await sendIdentityVerifiedEmail({
        to: email,
        userName: user ? getUserDisplayName(user) : "there",
        verifiedEmail: email
      })

      return { success: true, data: profile }
    } catch (error) {
      return { error: error }
    }
  }
)
