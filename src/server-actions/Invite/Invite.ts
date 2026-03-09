"use server"

import { randomBytes } from "crypto"
import { AuthUserAction } from "../User/AuthUserAction"
import { CreateServerAction } from ".."
import {
  createInvitation,
  getValidInvitationWithRole,
  updateJoinedEmail
} from "@/src/db/data-access/invite/query"
import { createInviteEmailNotification } from "@/src/services/notify/project/invite"
import { NotificationEvent } from "@/src/services/notify/types/events"
import { SelectInvitation } from "@/src/db/schema"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"

export const SendInvitationsAction = CreateServerAction(
  true,
  async (data: {
    emails: string[]
    roleName: string
    entityType: "community" | "space" | "channel"
    entityId: string
    role_offer_id: number
  }) => {
    try {
      const role_offer = data.roleName
      const authUser = await AuthUserAction()
      if (!authUser?.unique_id) {
        throw new Error("Authentication required to send invitations.")
      }

      const inviteKey = randomBytes(16).toString("hex")

      const invitation = await createInvitation({
        invite_key: inviteKey,
        entity_id: data.entityId,
        entity_type: data.entityType,
        role_offer_id: data.role_offer_id,
        invite_email: data.emails,
        invited_by: authUser.unique_id
      })
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      const inviteUrl = createAbsoluteUrl(
        `/invite/${invitation.entity_id}?type=${invitation.entity_type}&key=${invitation.invite_key}`
      )
      const finalInvitationPayLoad = { ...invitation, role_offer, inviteUrl }
      // Logic to send actual emails would go here
      await createInviteEmailNotification(
        NotificationEvent.JOIN_INVITE_EMAIL,
        finalInvitationPayLoad
      )
      return { success: true, data: finalInvitationPayLoad }
    } catch (error: any) {
      console.error("Error in SendInvitationsAction:", error)
      return {
        success: false,
        error: error.message || "Failed to process invitations."
      }
    }
  }
)

export const VerifyInviteAction = CreateServerAction(
  true,
  async (data: { key: string }) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser?.email) {
        throw new Error("You must be logged in to accept an invitation.")
      }

      const invitation = await getValidInvitationWithRole(
        data.key,
        authUser.email
      )

      if (!invitation) {
        return {
          success: false,
          error: "Invalid invitation, you were not invited with this email."
        }
      }

      const joinedEmails = invitation.joined_email as string[]
      if (joinedEmails.includes(authUser.email)) {
        return { success: true, alreadyJoined: true, data: invitation }
      }

      return { success: true, alreadyJoined: false, data: invitation }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
)

export const AcceptInvitationAction = async (inviteKey: string) => {
  try {
    const authUser = await AuthUserAction()
    if (!authUser?.email) throw new Error("User email not found")

    const result = await updateJoinedEmail(inviteKey, authUser.email)

    if (!result.length) {
      return { success: false, error: "Invitation not found." }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
