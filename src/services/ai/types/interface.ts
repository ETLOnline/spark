import {
  ModerationDetails,
  ModerationOutcome
} from "../schemas/postCheck.schema"

// --- Questions and answers (TypeSafe format) ---

export type NoulQuestion = {
  type: "noul"
  instructions: string
  criteria?: { true: string; false: string } | null
}

export type ChoiceQuestion = {
  type: "choice"
  instructions: string
  criteria: Record<string, string | null>
}

// Levels are described in order; each one's position is its score, starting at 0
export type ScoreQuestion = {
  type: "score"
  instructions: string
  criteria: string[]
}

export type TypeSafeQuestion = NoulQuestion | ChoiceQuestion | ScoreQuestion

export type NoulAnswer = { type: "noul"; noul: number }

export type ChoiceAnswer = {
  type: "choice"
  choice: string
  confidence: number
  probabilities: Record<string, number>
}

export type ScoreAnswer = {
  type: "score"
  score: number
  confidence: number
  // level -> description, keyed "0", "1", ...
  legend: Record<string, string>
  probabilities: Record<string, number>
}

export type TypeSafeAnswer = NoulAnswer | ChoiceAnswer | ScoreAnswer

export type SystemOneResponse<Q extends Record<string, TypeSafeQuestion>> = {
  model: string
  answers: {
    [K in keyof Q]: Q[K] extends NoulQuestion
      ? NoulAnswer
      : Q[K] extends ChoiceQuestion
        ? ChoiceAnswer
        : ScoreAnswer
  }
  usage: { input_tokens: number; output_tokens: number }
}

// Image sent inline as base64 (no "data:" prefix). Referenced from state by its key in `assets`.
export type TypeSafeImageAsset = {
  type: "image"
  format: "png" | "jpg" | "jpeg"
  data_base64: string
}

// Builds a question about whatever sits at `path` in the state, e.g. "post.text" or "images.image_1"
export type QuestionBuilder = (path: string) => NoulQuestion

// --- Moderation params and result (generic: posts, comments, profiles, ...) ---

// Image as it comes from the upload form (data URL)
export type UploadedImage = { fileType: string; fileBase64: string }

// Step 1 output: what a feature wants checked
export type ModerationInput<E extends string = never> = {
  // what is being checked, e.g. "post", "comment", "profile"; the text is sent to the model as `<subject>.text`
  subject: string
  // plain text, not HTML (see htmlToPlainText)
  text?: string | null
  images?: UploadedImage[]
  // extra yes/no questions about the same text, asked in the same request (e.g. post tags).
  // Each builder gets the state path of the text, e.g. "post.text".
  extraQuestions?: Record<E, QuestionBuilder>
}

// Step 2 output: everything moderate() needs to call the AI and read the answers
export type ModerationRequest<E extends string = never> = {
  subject: string
  // what the model reads
  state: Record<string, unknown>
  // what the model is asked; empty when there is nothing to check
  questions: Record<string, TypeSafeQuestion>
  // images referenced from `state.images`
  assets: Record<string, TypeSafeImageAsset>
  hasText: boolean
  // "image_1", "image_2", ... for each image that was prepared
  imageKeys: string[]
  extraKeys: E[]
}

// Step 3 output
export type ModerationResult<E extends string = never> = {
  // the decision: true -> publish now, false -> hold for an admin to review
  publish: boolean
  // safe / needs_review / blocked from the answers,
  // skipped -> nothing to check, error -> the AI is not configured or the call failed
  outcome: ModerationOutcome | "skipped" | "error"
  // why the content was held, e.g. "Hate speech", "image_1: Nudity"
  reasons: string[]
  // every answer behind the decision; only when the AI was asked
  details?: ModerationDetails
  // probability for each extra question; only when there was text to ask about
  extraScores?: Record<E, number>
  imagesChecked: number
  error?: string
}

// --- Adapter: one per AI provider, picked in client/ai.client.ts ---

export interface AIAdapter {
  isConfigured(): boolean
  // Step 2: data -> request (state + questions + images)
  buildState<E extends string = never>(
    input: ModerationInput<E>
  ): Promise<ModerationRequest<E>>
  // Step 3: ask the AI and decide whether the content can be published
  moderate<E extends string = never>(
    request: ModerationRequest<E>
  ): Promise<ModerationResult<E>>
}
