"use server"

import { UpdateUserBio } from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."

export const UpdateBioForUser = CreateServerAction(
  false,
  async (userId: string, newBio: string) => {
    try {
      await UpdateUserBio(userId, newBio)
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
)
