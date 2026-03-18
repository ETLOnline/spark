import { eq } from "drizzle-orm"
import { db } from "../.."
import {
  activityRulesTable,
  InsertPointLedger,
  InsertTrustVerification,
  pointLedgerTable,
  trustVerificationTable
} from "../../schema"

export function GetActivityRule(action_key: string) {
  try {
    const res = db.query.activityRulesTable.findFirst({
      where: eq(activityRulesTable.action_type, action_key)
    })
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export function AddLedgerEntry(data: InsertPointLedger) {
  try {
    const res = db.insert(pointLedgerTable).values(data).returning()
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export function AddVerificationEntry(data: InsertTrustVerification) {
  try {
    const res = db.insert(trustVerificationTable).values(data).returning()
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}
