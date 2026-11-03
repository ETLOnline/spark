import { TypeSafeAdapter } from "../adapters/typesafe.adapter"
import { AI_PROVIDER } from "../config"
import { AIAdapter } from "../types/interface"

// Swap point for AI providers: add a case here when a new adapter is added
export const getAIClient = (): AIAdapter => {
  switch (AI_PROVIDER.toLowerCase()) {
    case "typesafe":
    default:
      return TypeSafeAdapter
  }
}
