// All shared TypeSafe moderation question wording and thresholds live here, so they can be reviewed and tuned in one place.
// They are not tied to posts: every question gets the state path of what it checks
// (e.g. "post.text", "profile.text", "images.image_1"), so any feature can reuse them.
// Each part (the text, each image) is asked three kinds of question:
//   1. Choice - Jev's own verdict (safe / needs_review / blocked)
//   2. Noul   - one yes/no question per violation
//   3. Score  - severity from level 0 to level 4
// The publish / review decision is made in code (the adapter) by combining the answers.

import { ChoiceQuestion, NoulQuestion, ScoreQuestion } from "../types/interface"
import { ModerationOutcome } from "../schemas/postCheck.schema"

const noul = (instructions: string): NoulQuestion => ({
  type: "noul",
  instructions
})

const choice = (
  instructions: string,
  criteria: Record<ModerationOutcome, string>
): ChoiceQuestion => ({ type: "choice", instructions, criteria })

const score = (instructions: string, levels: string[]): ScoreQuestion => ({
  type: "score",
  instructions,
  criteria: levels
})

export type ModerationCheck = {
  // shown to users and admins, e.g. "Hate speech"
  label: string
  question: (path: string) => NoulQuestion
}

// The questions asked about one part; each builder gets that part's state path
export type ModerationQuestionSet = {
  verdict: (path: string) => ChoiceQuestion
  checks: Record<string, ModerationCheck>
  severity: (path: string) => ScoreQuestion
}

// Asked once about the text; `textPath` is where the text sits in the state, e.g. "post.text"
export const TEXT_MODERATION_QUESTIONS: ModerationQuestionSet = {
  verdict: (textPath) =>
    choice(`How should \`${textPath}\` be handled under our content policy?`, {
      safe: "Acceptable content.",
      needs_review:
        "Ambiguous or potentially harmful content that a person should check.",
      blocked: "Content that clearly violates the policy."
    }),
  checks: {
    abusive_language: {
      label: "Abusive language",
      question: (textPath) =>
        noul(`Does \`${textPath}\` contain abusive language?`)
    },
    harassment: {
      label: "Targeted harassment",
      question: (textPath) =>
        noul(`Does \`${textPath}\` contain targeted harassment?`)
    },
    hate_speech: {
      label: "Hate speech",
      question: (textPath) => noul(`Does \`${textPath}\` contain hate speech?`)
    },
    threat: {
      label: "Threats of violence",
      question: (textPath) =>
        noul(`Does \`${textPath}\` contain threats of violence?`)
    }
  },
  severity: (textPath) =>
    score(`How severe is the harmful content in \`${textPath}\`?`, [
      "No harmful content",
      "Mild profanity",
      "Personal insults",
      "Harassment or hate speech",
      "Serious threats or extreme harmful content"
    ])
}

// Asked once per image; `imagePath` is where the image sits in the state, e.g. "images.image_1"
export const IMAGE_MODERATION_QUESTIONS: ModerationQuestionSet = {
  verdict: (imagePath) =>
    choice(`How should \`${imagePath}\` be handled under our content policy?`, {
      safe: "Acceptable image with no nudity, sexual content, violence, or other prohibited content.",
      needs_review:
        "Suggestive, borderline, or possibly harmful image that a person should check.",
      blocked:
        "Image that clearly shows nudity, sexual content, graphic violence, or other prohibited content."
    }),
  checks: {
    explicit: {
      label: "Inappropriate / explicit",
      question: (imagePath) =>
        noul(`Is \`${imagePath}\` inappropriate or explicit?`)
    },
    nudity: {
      label: "Nudity",
      question: (imagePath) => noul(`Does \`${imagePath}\` show nudity?`)
    },
    sexual_content: {
      label: "Sexual content",
      question: (imagePath) =>
        noul(`Does \`${imagePath}\` show sexual content?`)
    },
    graphic_violence: {
      label: "Graphic violence",
      question: (imagePath) =>
        noul(`Does \`${imagePath}\` show graphic violence or gore?`)
    },
    prohibited: {
      label: "Other prohibited content",
      question: (imagePath) =>
        noul(
          `Does \`${imagePath}\` show other prohibited content, such as hate symbols, self-harm, illegal drug use, or weapons aimed at people?`
        )
    }
  },
  severity: (imagePath) =>
    score(`How severe is the harmful content in \`${imagePath}\`?`, [
      "No harmful content",
      "Mildly suggestive or mildly violent",
      "Partial nudity or non-graphic violence",
      "Explicit nudity, sexual content, or graphic violence",
      "Extreme content such as sexual violence or extreme gore"
    ])
}

// Noul probability at or above YES reads as "yes" (flagged), below NO reads as "no" (clear),
// anything between is "not settled" (uncertain) and goes to review.
export const NOUL_YES_THRESHOLD = 0.7
export const NOUL_NO_THRESHOLD = 0.3

// Severity: the part is blocked when level BLOCK or above is a clear "yes",
// and goes to review when level REVIEW or above is not a clear "no".
// Text: 2 = personal insults, 3 = harassment or hate speech.
// Images: 2 = partial nudity or non-graphic violence, 3 = explicit or graphic.
export const SEVERITY_REVIEW_LEVEL = 2
export const SEVERITY_BLOCK_LEVEL = 3
