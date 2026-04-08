import { db } from "../.."
import {
  InsertSuccessfulReferral,
  successfullReferralsTable
} from "../../schema"

export async function AddSuccessfulReferral(data: InsertSuccessfulReferral) {
  try {
    const res = db.insert(successfullReferralsTable).values(data).returning()
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}
