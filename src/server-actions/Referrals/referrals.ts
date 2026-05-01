"use server"
import { AddSuccessfulReferral } from "@/src/db/data-access/referrals/query"
import { InsertSuccessfulReferral } from "@/src/db/schema"

export const AddsuccessfulReferralAction = async (
  data: InsertSuccessfulReferral
) => {
  try {
    const res = await AddSuccessfulReferral(data)
    return { success: true, data: res }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
