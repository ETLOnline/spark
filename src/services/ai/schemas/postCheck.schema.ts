// Post check data shapes. Plain zod schemas and constants only, so client components can import this file.
import { z } from "zod"

// AI tags that can be put on a post
export const postAiTagSchema = z.enum([
  "helpful",
  "impressive",
  "productive",
  "interesting_idea",
  "inspiring",
  "asking_for_help",
  "opportunity",
  // Products
  "product",
  "product_launch",
  "feedback_request",
  // Mentorship
  "mentor_request",
  "mentor_offer",
  // Events
  "event",
  "event_invite",
  // Software and tech
  "software",
  "ai",
  "technical_help",
  // People and opportunities
  "cofounder_search",
  "hiring",
  "job_search",
  "collaboration",
  "funding",
  // Knowledge sharing
  "learning_resource",
  "question"
])

export type PostAiTag = z.infer<typeof postAiTagSchema>

// Label shown to users for each tag
export const POST_AI_TAG_LABELS: Record<PostAiTag, string> = {
  helpful: "Helpful",
  impressive: "Impressive",
  productive: "Productive",
  interesting_idea: "Interesting Idea",
  inspiring: "Inspiring",
  asking_for_help: "Asking for Help",
  opportunity: "Opportunity",
  product: "Product",
  product_launch: "Product Launch",
  feedback_request: "Feedback Request",
  mentor_request: "Looking for Mentor",
  mentor_offer: "Offering Mentorship",
  event: "Event",
  event_invite: "Event Invite",
  software: "Software",
  ai: "AI",
  technical_help: "Technical Help",
  cofounder_search: "Co-founder Search",
  hiring: "Hiring",
  job_search: "Job Search",
  collaboration: "Collaboration",
  funding: "Funding",
  learning_resource: "Learning Resource",
  question: "Question"
}

export const isPostAiTag = (tag: string): tag is PostAiTag =>
  postAiTagSchema.safeParse(tag).success

// What readers of a post see: Tiptap HTML, poll options and uploaded images
export const postCheckInputSchema = z.object({
  content: z.string().nullish(),
  pollOptions: z.array(z.string()).optional(),
  images: z
    .array(z.object({ fileType: z.string(), fileBase64: z.string() }))
    .optional()
})

export type PostCheckInput = z.infer<typeof postCheckInputSchema>

// --- Moderation result: Jev's answers plus the decision made in code ---
// Question wording, labels and thresholds live in prompts/moderation.questions.ts.

const probability = z.number().min(0).max(1)

export const moderationOutcomeSchema = z.enum([
  "safe",
  "needs_review",
  "blocked"
])

export type ModerationOutcome = z.infer<typeof moderationOutcomeSchema>

// clear -> below 30%, uncertain -> 30-70%, flagged -> 70% or more
export const checkStatusSchema = z.enum(["clear", "uncertain", "flagged"])

export type CheckStatus = z.infer<typeof checkStatusSchema>

// One Noul answer, e.g. "hate_speech" or "nudity"
export const checkResultSchema = z.object({
  // question id sent to Jev
  id: z.string(),
  label: z.string(),
  // probability (0-1) that the answer is "yes"
  probability,
  status: checkStatusSchema
})

export type CheckResult = z.infer<typeof checkResultSchema>

export const moderationDecisionSchema = z.object({
  outcome: moderationOutcomeSchema,
  reasons: z.array(z.string())
})

export type ModerationDecision = z.infer<typeof moderationDecisionSchema>

// Answers about one part of the post: its text, or one image
export const moderationPartResultSchema = z.object({
  // "text", "image_1", "image_2", ...
  part: z.string(),
  // Jev's own Choice answer
  verdict: z.object({
    choice: moderationOutcomeSchema,
    confidence: probability,
    probabilities: z.record(moderationOutcomeSchema, probability)
  }),
  // Jev's Score answer (0 = none ... 4 = severe)
  severity: z.object({
    score: z.number().min(0).max(4),
    confidence: probability,
    probabilities: z.record(z.string(), probability),
    legend: z.record(z.string(), z.string())
  }),
  // Noul answers, one per violation type
  checks: z.array(checkResultSchema),
  // decision for this part, made in code by combining the answers above
  decision: moderationDecisionSchema
})

export type ModerationPartResult = z.infer<typeof moderationPartResultSchema>

export const moderationDetailsSchema = z.object({
  // the strictest decision across the text and every image
  decision: moderationDecisionSchema,
  // absent when the post has no text
  text: moderationPartResultSchema.optional(),
  images: z.array(moderationPartResultSchema),
  // untouched `answers` object from the API, for inspection
  raw: z.unknown()
})

export type ModerationDetails = z.infer<typeof moderationDetailsSchema>

// Saved on a held post (posts.moderation_result). Each answer is stored once, in `details`;
// the overall verdict and top checks the admin sees are worked out from it (getModerationSummary).
export const postModerationResultSchema = z.object({
  // blocked / needs_review from the AI, error -> the AI is not configured or the call failed
  outcome: z.enum(["needs_review", "blocked", "error"]),
  // one readable line for the admin, e.g. "This post may contain hate speech, nudity."
  reason: z.string(),
  // every answer for the text and each image (verdict, severity, every check, decision);
  // absent when the check failed
  details: moderationDetailsSchema.omit({ raw: true }).optional(),
  error: z.string().optional(),
  checked_at: z.string(),
  // set when an admin approves or rejects the post; the admin's id is in posts.reviewed_by
  review: z
    .object({
      action: z.enum(["approved", "rejected"]),
      reviewed_at: z.string()
    })
    .optional()
})

export type PostModerationResult = z.infer<typeof postModerationResultSchema>

const OUTCOME_RANK: Record<ModerationOutcome, number> = {
  safe: 0,
  needs_review: 1,
  blocked: 2
}

// Overall view of a saved result: the strictest part's verdict, and every check once
// (text and images merged, each label at its highest probability), highest first
export function getModerationSummary(result?: PostModerationResult | null) {
  const details = result?.details
  const parts = details
    ? [...(details.text ? [details.text] : []), ...details.images]
    : []

  const strictest = parts.reduce<ModerationPartResult | undefined>(
    (worst, part) =>
      !worst ||
      OUTCOME_RANK[part.decision.outcome] > OUTCOME_RANK[worst.decision.outcome]
        ? part
        : worst,
    undefined
  )

  const byLabel = new Map<string, CheckResult>()
  for (const check of parts.flatMap((p) => p.checks)) {
    const seen = byLabel.get(check.label)
    if (!seen || check.probability > seen.probability) {
      byLabel.set(check.label, check)
    }
  }

  return {
    verdict: strictest?.verdict,
    checks: [...byLabel.values()].sort((a, b) => b.probability - a.probability)
  }
}

// What the server action gets back from checkPost()
export const postCheckResultSchema = z.object({
  // true -> save the post, false -> hold it and show `message`
  publish: z.boolean(),
  // skipped -> nothing to check, error -> the AI is not configured or the call failed
  outcome: z.union([moderationOutcomeSchema, z.enum(["skipped", "error"])]),
  reasons: z.array(z.string()),
  aiTags: z.array(postAiTagSchema),
  // absent when nothing was checked or the check failed
  moderation: moderationDetailsSchema.optional(),
  // what to save on the post when it is held; absent when it can be published
  moderationResult: postModerationResultSchema.optional(),
  message: z.string().optional()
})

export type PostCheckResult = z.infer<typeof postCheckResultSchema>
