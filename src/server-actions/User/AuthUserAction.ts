"use server"

import { SelectUserByExternalId } from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."
import { auth } from "@clerk/nextjs/server"
import { readFileSync } from "fs"

export const AuthUserAction = CreateServerAction(true, async () => {
  try {
    const clerkUser = await auth({acceptsToken:['api_key','session_token']})
    if (!clerkUser || !clerkUser.isAuthenticated || !clerkUser.userId) {
      throw new Error("Unauthorized", { cause: 401 })
    }
    const user = await SelectUserByExternalId(clerkUser.userId)

    if (!user) {
      throw new Error("User not found", { cause: 401 })
    }

    return user
  } catch (error) {
    throw new Error("Unauthorized", { cause: error })
  }
})
