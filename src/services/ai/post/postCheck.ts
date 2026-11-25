// The post-specific parts of the AI check. The flow itself is generic:
//   1. buildPostModerationInput()  - post -> text + images (this file)
//   2. buildState()                - adapter
//   3. moderate()                  - adapter
//   4. save the post as published, or as pending review with `moderationResult` (server action)

import { getAIClient } from "../client/ai.client"
import { TAG_THRESHOLD } from "../constants"
import { POST_TAG_QUESTIONS } from "../prompts/postTags.questions"
import {
  PostAiTag,
  PostCheckInput,
  PostCheckResult,
  PostModerationResult
} from "../schemas/postCheck.schema"
import { ModerationInput, ModerationResult } from "../types/interface"
import { htmlToPlainText } from "../utils/text"
import {
  AI_FAILED_REASON,
  POST_UNDER_REVIEW_MESSAGE
} from "./postCheck.messages"

type AiPostResult = ModerationResult<PostAiTag>

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
export function getPostTags(result: AiPostResult): PostAiTag[] {
  const tagScores = result.extraScores
  if (!tagScores) return []
  return (Object.keys(tagScores) as PostAiTag[]).filter(
    (tag) => tagScores[tag] >= TAG_THRESHOLD
  )
}

// Labels of the checks that held the post, e.g. ["hate speech", "nudity"]
const heldChecks = (result: AiPostResult) => {
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

// What is saved on a held post: the outcome, a readable reason and every answer
// for the text and images (without the untouched API response)
export function buildPostModerationResult(
  result: AiPostResult
): PostModerationResult {
  const checked_at = new Date().toISOString()
  const details = result.details
  if (result.outcome === "error" || !details) {
    return {
      outcome: "error",
      reason: AI_FAILED_REASON,
      error: result.error,
      checked_at
    }
  }

  const held = heldChecks(result)
  const { raw, ...answers } = details
  return {
    outcome:
      details.decision.outcome === "blocked" ? "blocked" : "needs_review",
    reason: held.length
      ? `This post may contain ${held.join(", ")}.`
      : "This post may break our community guidelines.",
    details: answers,
    checked_at
  }
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
    moderationResult: result.publish
      ? undefined
      : buildPostModerationResult(result),
    message: result.publish ? undefined : POST_UNDER_REVIEW_MESSAGE
  }
}
