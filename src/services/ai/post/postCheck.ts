// The post-specific parts of the AI check. The flow itself is generic:
//   1. buildPostModerationInput()  - post -> text + images (this file)
//   2. buildState()                - adapter
//   3. moderate()                  - adapter
//   4. save the post according to `result.publish` (server action)

import { getAIClient } from "../client/ai.client"
import {
  POST_TAG_QUESTIONS,
  TAG_THRESHOLD
} from "../prompts/postTags.questions"
import {
  PostAiTag,
  PostCheckInput,
  PostCheckResult
} from "../schemas/postCheck.schema"
import { ModerationInput, ModerationResult } from "../types/interface"
import { htmlToPlainText } from "../utils/text"

type PostModerationResult = ModerationResult<PostAiTag>

// Step 1: what readers of the post see, as plain text and images, plus the tag questions
export function buildPostModerationInput(
  post: PostCheckInput
): ModerationInput<PostAiTag> {
  const text = htmlToPlainText(post.content ?? "")
  const pollOptions = (post.pollOptions ?? []).filter((o) => o.trim())
  return {
    subject: "post",
    // poll options are part of what readers see, so they are checked with the text
    text: pollOptions.length
      ? `${text}\n\nPoll options:\n${pollOptions.map((o) => `- ${o}`).join("\n")}`.trim()
      : text,
    images: post.images,
    extraQuestions: POST_TAG_QUESTIONS
  }
}

// Positive tags for the post (helpful, impressive, ...); empty when there was no text or the check failed
export function getPostTags(result: PostModerationResult): PostAiTag[] {
  const tagScores = result.extraScores
  if (!tagScores) return []
  return (Object.keys(tagScores) as PostAiTag[]).filter(
    (tag) => tagScores[tag] >= TAG_THRESHOLD
  )
}

// Labels of the checks that held the post, e.g. ["hate speech", "nudity"]
const heldChecks = (result: PostModerationResult) => {
  const details = result.details
  if (!details) return []
  const status =
    details.decision.outcome === "blocked" ? "flagged" : "uncertain"
  const parts = [...(details.text ? [details.text] : []), ...details.images]
  const labels = parts.flatMap((p) =>
    p.checks
      .filter((c) => c.status === status)
      .map((c) => c.label.toLowerCase())
  )
  return [...new Set(labels)]
}

// Message for a post that was not published
export function getModerationMessage(result: PostModerationResult) {
  if (!result.details) {
    return "We couldn't check your post right now. Please try again in a moment."
  }
  const checks = heldChecks(result)
  return checks.length
    ? `Your post can't be published because it may contain ${checks.join(", ")}. Please edit it and try again.`
    : "Your post can't be published because it may break our community guidelines. Please edit it and try again."
}

// Runs steps 1-3 for a post
export async function checkPost(
  post: PostCheckInput
): Promise<PostCheckResult> {
  const ai = getAIClient()
  // 1. data: what readers will see
  const input = buildPostModerationInput(post)
  // 2. state: what the model reads and is asked
  const request = await ai.buildState(input)
  // 3. moderation: publish now, or hold for review
  const result = await ai.moderate(request)

  return {
    publish: result.publish,
    outcome: result.outcome,
    reasons: result.reasons,
    aiTags: getPostTags(result),
    moderation: result.details,
    message: result.publish ? undefined : getModerationMessage(result)
  }
}
