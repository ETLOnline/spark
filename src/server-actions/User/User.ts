"use server"

import { GetUserBio, UpdateUserBio } from "@/src/db/data-access/user/query"
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

export const GetUserBioForUser = CreateServerAction(
  false,
  async (userId: string) => {
    try {
      const user = await GetUserBio(userId)
      return {
        success: true,
        data: user
      }
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
)
