"use server"

import { InsertInterest } from "../../db/schema"
import { CreateServerAction } from ".."
import {
  AddInterest,
  DeleteInterest
} from "@/src/db/data-access/interests/query"
import exp from "constants"

export const AddInterestForUser = CreateServerAction(
  false,
  async (interestData: InsertInterest) => {
    try {
      const data = await AddInterest(interestData)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export const DeleteInterestForUser = CreateServerAction(
  false,
  async (userId: string, interestName: string) => {
    try {
      const data = await DeleteInterest(userId, interestName)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export type InterestAdder = typeof AddInterestForUser
export type InterestDeleter = typeof DeleteInterestForUser
