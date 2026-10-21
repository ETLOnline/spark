import { z } from "zod"

/** Shared primitives reused across more than one report module. */

export const RankedUserInfoSchema = z.object({
  user_name: z.string(),
  email: z.string(),
  total: z.number()
})

export const GroupCountEntrySchema = z.object({
  value: z.string(),
  count: z.number()
})
