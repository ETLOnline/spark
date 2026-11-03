// Server-only: the API key must never reach a client component.
export const AI_PROVIDER = process.env.AI_PROVIDER || "typesafe"

// TypeSafe (System One / Jev). Docs: https://docs.typesafe.ai/go/api.md
export const TYPESAFE_API_KEY = process.env.TYPESAFE_API_KEY || ""
export const TYPESAFE_API_URL = "https://api.typesafe.ai/v1/systemone"
export const TYPESAFE_MODEL = process.env.TYPESAFE_MODEL || "jev-latest"
export const TYPESAFE_TIMEOUT_MS = 10_000
export const TYPESAFE_IMAGE_TIMEOUT_MS = 20_000
