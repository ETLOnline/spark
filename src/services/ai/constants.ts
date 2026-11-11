// Every number the AI check uses, in one place so they can be reviewed and tuned together.
// Plain values only, so client components can import this file.

// --- Request limits ---

// TypeSafe image rules: each side must be 280-1568 px. Docs: https://docs.typesafe.ai/go/images.md
export const MIN_IMAGE_SIDE = 280
export const MAX_IMAGE_SIDE = 1568

// how long to wait for TypeSafe; images take longer
export const TYPESAFE_TIMEOUT_MS = 10_000
export const TYPESAFE_IMAGE_TIMEOUT_MS = 20_000

// --- Decision thresholds ---

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

// a post tag is added when its Noul is at least this likely
export const TAG_THRESHOLD = 0.7

// --- Admin moderation page ---

// held posts per page
export const MODERATION_PAGE_SIZE = 10
// checks shown as bars in the review modal (every check is saved)
export const TOP_CHECKS_COUNT = 3
