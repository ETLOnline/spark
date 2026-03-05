"use server"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { AddToQueue } from "../../queue/addToQueue"
import { SelectInvitation } from "@/src/db/schema"
import { getSiteLogoUrl } from "@/src/utils/clientHelper"

type invitePayLoad = SelectInvitation & {role_offer : string}
export async function createInviteEmailNotification(
  event: string,
  invite: invitePayLoad
) {
  const authUser = await AuthUserAction();
  const inviterName = authUser ? `${authUser.first_name} ${authUser.last_name}` : "Someone";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const inviteUrl = `${baseUrl}/invite/${invite.entity_id}?type=${invite.entity_type}&key=${invite.invite_key}`;
  const payload = {
    logoUrl: getSiteLogoUrl(),
    subject: `You've Been Invited to join ${invite.entity_type}!`,
    inviterName: inviterName,
    entityName: invite.entity_id,
    roleOffer: invite.role_offer,
    ctaLink: inviteUrl,
  }

  const sendingTo = invite.invite_email as string[];

  await AddToQueue({
    sendingTo: sendingTo, 
    event: event,
    payload: payload,
    withData: true
  })
}