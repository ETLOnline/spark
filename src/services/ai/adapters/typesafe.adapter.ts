// TypeSafe (System One / Jev) implementation of AIAdapter.
// Docs: https://docs.typesafe.ai/go/api.md
// Server-only: never import this from a client component, the API key must stay on the server.

import {
  TYPESAFE_API_KEY,
  TYPESAFE_API_URL,
  TYPESAFE_IMAGE_TIMEOUT_MS,
  TYPESAFE_MODEL,
  TYPESAFE_TIMEOUT_MS
} from "../config"
import {
  AIAdapter,
  ChoiceAnswer,
  ModerationInput,
  ModerationRequest,
  ModerationResult,
  NoulAnswer,
  QuestionBuilder,
  ScoreAnswer,
  SystemOneResponse,
  TypeSafeAnswer,
  TypeSafeImageAsset,
  TypeSafeQuestion
} from "../types/interface"
import {
  IMAGE_MODERATION_QUESTIONS,
  ModerationQuestionSet,
  NOUL_NO_THRESHOLD,
  NOUL_YES_THRESHOLD,
  SEVERITY_BLOCK_LEVEL,
  SEVERITY_REVIEW_LEVEL,
  TEXT_MODERATION_QUESTIONS
} from "../prompts/moderation.questions"
import {
  CheckStatus,
  ModerationDecision,
  ModerationOutcome,
  ModerationPartResult
} from "../schemas/postCheck.schema"
import { prepareImagesForTypeSafe } from "../utils/images"

export class TypeSafeRequestError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = "TypeSafeRequestError"
  }
}

// --- HTTP ---

export async function askSystemOne<Q extends Record<string, TypeSafeQuestion>>(
  state: unknown,
  questions: Q,
  assets?: Record<string, TypeSafeImageAsset>
): Promise<SystemOneResponse<Q>> {
  const hasImages = !!assets && Object.keys(assets).length > 0

  if (!TYPESAFE_API_KEY) {
    throw new TypeSafeRequestError("TYPESAFE_API_KEY is not set")
  }

  let res: Response
  try {
    res = await fetch(TYPESAFE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TYPESAFE_API_KEY}`,
        "Content-Type": "application/json",
        // images are a preview feature and must be switched on per request
        ...(hasImages ? { "TypeSafe-Danger-Zone-Images": "true" } : {})
      },
      body: JSON.stringify({
        model: TYPESAFE_MODEL,
        state,
        questions,
        ...(hasImages ? { assets } : {})
      }),
      signal: AbortSignal.timeout(
        hasImages ? TYPESAFE_IMAGE_TIMEOUT_MS : TYPESAFE_TIMEOUT_MS
      ),
      cache: "no-store"
    })
  } catch (error: any) {
    throw new TypeSafeRequestError(
      `TypeSafe request failed: ${error?.message ?? error}`
    )
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new TypeSafeRequestError(
      `TypeSafe responded ${res.status}: ${body}`,
      res.status
    )
  }

  return (await res.json()) as SystemOneResponse<Q>
}

// --- Step 2: state ---

const MAX_TEXT_LENGTH = 8000

const PLATFORM_CONTEXT =
  "Spark, the ETL Online community where students, mentors, and professionals share updates, questions, and projects."

// prefix keeps extra question ids from clashing with moderation question ids
export const EXTRA_QUESTION_PREFIX = "extra__"

// the text is the "text" part, each image is its own part ("image_1", ...)
const TEXT_PART = "text"

// question id for one question about one part, e.g. "image_1__nudity", "text__verdict"
export const partQuestionId = (part: string, key: string) => `${part}__${key}`

// Builds every question in `builders` about the same state path
const buildQuestions = (
  builders: Record<string, QuestionBuilder>,
  path: string,
  toId: (key: string) => string = (key) => key
): Record<string, TypeSafeQuestion> =>
  Object.fromEntries(
    Object.entries(builders).map(([key, build]) => [toId(key), build(path)])
  )

// Verdict, checks and severity for one part, keyed by partQuestionId
const buildPartQuestions = (
  set: ModerationQuestionSet,
  part: string,
  path: string
): Record<string, TypeSafeQuestion> => ({
  [partQuestionId(part, "verdict")]: set.verdict(path),
  ...Object.fromEntries(
    Object.entries(set.checks).map(([key, check]) => [
      partQuestionId(part, key),
      check.question(path)
    ])
  ),
  [partQuestionId(part, "severity")]: set.severity(path)
})

async function buildState<E extends string = never>(
  input: ModerationInput<E>
): Promise<ModerationRequest<E>> {
  const text = (input.text ?? "").trim().slice(0, MAX_TEXT_LENGTH)
  const images = await prepareImagesForTypeSafe(input.images)
  // image_1, image_2, ... -> asset ref; the model sees these keys in `images`
  const imageKeys = images.map((_, i) => `image_${i + 1}`)
  const textPath = `${input.subject}.text`
  const extraKeys = (
    text && input.extraQuestions ? Object.keys(input.extraQuestions) : []
  ) as E[]

  const state = {
    platform: PLATFORM_CONTEXT,
    ...(text ? { [input.subject]: { text } } : {}),
    ...(images.length
      ? {
          images: Object.fromEntries(
            images.map((img, i) => [imageKeys[i], img.ref])
          )
        }
      : {})
  }

  // text, extra and image questions share the same state, so they go in one request
  const questions: Record<string, TypeSafeQuestion> = {
    ...(text
      ? buildPartQuestions(TEXT_MODERATION_QUESTIONS, TEXT_PART, textPath)
      : {}),
    ...(extraKeys.length
      ? buildQuestions(
          input.extraQuestions!,
          textPath,
          (key) => EXTRA_QUESTION_PREFIX + key
        )
      : {})
  }
  for (const key of imageKeys) {
    Object.assign(
      questions,
      buildPartQuestions(IMAGE_MODERATION_QUESTIONS, key, `images.${key}`)
    )
  }

  return {
    subject: input.subject,
    state,
    questions,
    assets: Object.fromEntries(images.map((img) => [img.ref, img.asset])),
    hasText: !!text,
    imageKeys,
    extraKeys
  }
}

// --- Step 3: moderate ---

// Only safe content, or content with nothing to check, is published straight away.
// Harmful, unsettled, and unchecked (TypeSafe down) content waits for review.
const PUBLISH_OUTCOMES: ModerationResult["outcome"][] = ["safe", "skipped"]

const OUTCOME_RANK: Record<ModerationOutcome, number> = {
  safe: 0,
  needs_review: 1,
  blocked: 2
}

const checkStatus = (probability: number): CheckStatus =>
  probability >= NOUL_YES_THRESHOLD
    ? "flagged"
    : probability > NOUL_NO_THRESHOLD
      ? "uncertain"
      : "clear"

// probability that the severity is `level` or higher
const severityAtLeast = (severity: ScoreAnswer, level: number) =>
  Object.entries(severity.probabilities)
    .filter(([key]) => Number(key) >= level)
    .reduce((sum, [, p]) => sum + p, 0)

// The truth table for one part:
//   blocked      -> any check flagged, Jev's verdict is "blocked", or severity >= BLOCK level is a clear "yes"
//   needs_review -> any check uncertain, Jev's verdict is "needs_review", or severity >= REVIEW level is not a clear "no"
//   safe         -> everything else
function decidePart(
  verdict: ChoiceAnswer,
  severity: ScoreAnswer,
  checks: ModerationPartResult["checks"]
): ModerationDecision {
  const severityReason = `Severity: ${severity.score.toFixed(2)}`

  const flagged = checks.filter((c) => c.status === "flagged")
  const severeBlock =
    severityAtLeast(severity, SEVERITY_BLOCK_LEVEL) >= NOUL_YES_THRESHOLD
  if (flagged.length || verdict.choice === "blocked" || severeBlock) {
    return {
      outcome: "blocked",
      reasons: [
        ...flagged.map((c) => c.label),
        ...(verdict.choice === "blocked" ? ["Jev Choice: blocked"] : []),
        ...(severeBlock ? [severityReason] : [])
      ]
    }
  }

  const uncertain = checks.filter((c) => c.status === "uncertain")
  const severeReview =
    severityAtLeast(severity, SEVERITY_REVIEW_LEVEL) > NOUL_NO_THRESHOLD
  if (uncertain.length || verdict.choice === "needs_review" || severeReview) {
    return {
      outcome: "needs_review",
      reasons: [
        ...uncertain.map((c) => c.label),
        ...(verdict.choice === "needs_review"
          ? ["Jev Choice: needs_review"]
          : []),
        ...(severeReview ? [severityReason] : [])
      ]
    }
  }

  return { outcome: "safe", reasons: ["Jev Choice: safe"] }
}

// Reads the verdict, checks and severity answers for one part and decides it
function readPart(
  set: ModerationQuestionSet,
  part: string,
  answers: Record<string, TypeSafeAnswer>
): ModerationPartResult {
  const verdict = answers[partQuestionId(part, "verdict")] as ChoiceAnswer
  const severity = answers[partQuestionId(part, "severity")] as ScoreAnswer
  const checks = Object.entries(set.checks).map(([key, check]) => {
    const id = partQuestionId(part, key)
    const probability = (answers[id] as NoulAnswer).noul
    return {
      id,
      label: check.label,
      probability,
      status: checkStatus(probability)
    }
  })

  return {
    part,
    verdict: {
      choice: verdict.choice as ModerationOutcome,
      confidence: verdict.confidence,
      probabilities: verdict.probabilities as Record<ModerationOutcome, number>
    },
    severity: {
      score: severity.score,
      confidence: severity.confidence,
      probabilities: severity.probabilities,
      legend: severity.legend
    },
    checks,
    decision: decidePart(verdict, severity, checks)
  }
}

// The strictest part decides; image reasons are prefixed with the image, e.g. "image_1: Nudity"
function combineParts(parts: ModerationPartResult[]): ModerationDecision {
  const outcome = parts.reduce<ModerationOutcome>(
    (worst, p) =>
      OUTCOME_RANK[p.decision.outcome] > OUTCOME_RANK[worst]
        ? p.decision.outcome
        : worst,
    "safe"
  )
  const reasons = parts
    .filter((p) => p.decision.outcome === outcome)
    .flatMap((p) =>
      p.part === TEXT_PART
        ? p.decision.reasons
        : p.decision.reasons.map((r) => `${p.part}: ${r}`)
    )
  return { outcome, reasons }
}

const withDecision = <E extends string>(
  result: Omit<ModerationResult<E>, "publish">
): ModerationResult<E> => ({
  ...result,
  publish: PUBLISH_OUTCOMES.includes(result.outcome)
})

async function moderate<E extends string = never>(
  request: ModerationRequest<E>
): Promise<ModerationResult<E>> {
  const log = `[moderation:${request.subject}]`

  if (!Object.keys(request.questions).length) {
    return withDecision({ outcome: "skipped", reasons: [], imagesChecked: 0 })
  }

  if (!TYPESAFE_API_KEY) {
    console.warn(`${log} TYPESAFE_API_KEY is not set, content goes to review`)
    return withDecision({
      outcome: "error",
      reasons: [],
      imagesChecked: 0,
      error: "TYPESAFE_API_KEY is not set"
    })
  }

  try {
    console.log(`${log} TypeSafe request state:`, JSON.stringify(request.state))

    const response = await askSystemOne(
      request.state,
      request.questions,
      request.assets
    )

    console.log(`${log} TypeSafe raw response:`, response)

    const answers = response.answers as Record<string, TypeSafeAnswer>

    const text = request.hasText
      ? readPart(TEXT_MODERATION_QUESTIONS, TEXT_PART, answers)
      : undefined
    const images = request.imageKeys.map((key) =>
      readPart(IMAGE_MODERATION_QUESTIONS, key, answers)
    )
    const parts = [...(text ? [text] : []), ...images]
    const decision = combineParts(parts)

    const extraScores = request.extraKeys.length
      ? (Object.fromEntries(
          request.extraKeys.map((key) => [
            key,
            (answers[EXTRA_QUESTION_PREFIX + key] as NoulAnswer).noul
          ])
        ) as Record<E, number>)
      : undefined

    for (const part of parts) {
      console.log(
        `${log} ${part.part}: ${part.decision.outcome}`,
        `| Jev Choice: ${part.verdict.choice}`,
        `| Severity: ${part.severity.score.toFixed(2)}`
      )
      console.table(
        Object.fromEntries(part.checks.map((c) => [c.label, c.probability]))
      )
    }
    if (extraScores) {
      console.log(`${log} Extra question scores:`)
      console.table(extraScores)
    }
    console.log(
      `${log} Outcome: ${decision.outcome}`,
      decision.reasons.length
        ? `| Reasons: ${decision.reasons.join(", ")}`
        : "",
      `| Images checked: ${request.imageKeys.length}`
    )

    return withDecision({
      outcome: decision.outcome,
      reasons: decision.reasons,
      details: { decision, text, images, raw: response.answers },
      extraScores,
      imagesChecked: request.imageKeys.length
    })
  } catch (error: any) {
    const message =
      error instanceof TypeSafeRequestError
        ? error.message
        : String(error?.message ?? error)
    console.error(`${log} TypeSafe moderation failed:`, message)
    return withDecision({
      outcome: "error",
      reasons: [],
      imagesChecked: 0,
      error: message
    })
  }
}

export const TypeSafeAdapter: AIAdapter = {
  isConfigured: () => !!TYPESAFE_API_KEY,
  buildState,
  moderate
}
