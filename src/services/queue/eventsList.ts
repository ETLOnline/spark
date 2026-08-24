import { processChatNotification } from "./processors/chat"
import {
  processAdminNewCommunityRequestNotification,
  processSubmitCommunityRequestNotification,
  processUserCommunityRequestAcceptedNotification,
  processUserCommunityRequestRejectedNotification
} from "./processors/community"
import { processContactNotification } from "./processors/contact"
import {
  processFeedbackSubmittedNotification,
  processNewFeedbackAdminNotification
} from "./processors/feedback"
import {
  processContactUsSubmittedNotification,
  processNewContactUsAdminNotification
} from "./processors/contact-us"
import { processJoinInviteEmailNotification } from "./processors/join_invite"
import { processProjectInviteNotification } from "./processors/project"
import { processTaskUpdateNotification } from "./processors/task"
import { processMentorSessionNotification } from "./processors/mentor-session"
import { processSessionRequestEmailNotification } from "./processors/sessionRequest"
import {
  processIdentityVerificationOtpNotification,
  processIdentityVerifiedNotification
} from "./processors/identityVerification"

interface EventJob {
  sendingTo: string[]
  event: string
  payload: any
}

type EventProcessor = (job: EventJob) => Promise<void>

export const eventsList: Record<string, EventProcessor> = {
  update_task: processTaskUpdateNotification,
  new_connection: processContactNotification,
  accept_connection: processContactNotification,
  project_invite: processProjectInviteNotification,
  chat_invite: processChatNotification,
  community_request: processSubmitCommunityRequestNotification,
  join_invite_email: processJoinInviteEmailNotification,
  admin_new_community_request: processAdminNewCommunityRequestNotification,
  community_request_accepted: processUserCommunityRequestAcceptedNotification,
  community_request_rejected: processUserCommunityRequestRejectedNotification,
  feedback_submitted: processFeedbackSubmittedNotification,
  new_feedback_admin: processNewFeedbackAdminNotification,
  contact_us_submitted: processContactUsSubmittedNotification,
  new_contact_us_admin: processNewContactUsAdminNotification,
  session_slot_suggested: processMentorSessionNotification,
  new_session_request: processSessionRequestEmailNotification,
  session_request_accepted: processSessionRequestEmailNotification,
  session_request_rejected: processSessionRequestEmailNotification,
  identity_verification_otp: processIdentityVerificationOtpNotification,
  identity_verified: processIdentityVerifiedNotification,
  advisor_request_accepted: processSessionRequestEmailNotification,
  advisor_request_rejected: processSessionRequestEmailNotification
}
