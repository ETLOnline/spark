// Post check messages. Plain constants only, so client components can import this file.

// Message for the author of a post that was held
export const POST_UNDER_REVIEW_MESSAGE =
  "Your post is under review and will be visible to others once an admin approves it."

// Reason shown to the admin when AI moderation is switched off
export const MANUAL_REVIEW_REASON =
  "AI moderation is turned off, so this post needs manual review."

// Reason shown to the admin when the AI could not check the post
export const AI_FAILED_REASON =
  "The AI service failed to check this post. Please review it manually."
