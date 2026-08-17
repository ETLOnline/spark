import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { emailOtpsTable } from "../../schema"

export async function CreateOrReplaceOtp(
  email: string,
  otp: string,
  expiresAt: string
) {
  try {
    return await db.transaction(async (tx) => {
      await tx.delete(emailOtpsTable).where(eq(emailOtpsTable.email, email))

      const inserted = await tx
        .insert(emailOtpsTable)
        .values({ email, otp, expires_at: expiresAt })
        .returning()

      return inserted[0]
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetOtpByEmail(email: string) {
  try {
    const rows = await db
      .select()
      .from(emailOtpsTable)
      .where(eq(emailOtpsTable.email, email))

    return rows[0] ?? null
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function VerifyAndConsumeOtp(email: string, otp: string) {
  try {
    const deleted = await db
      .delete(emailOtpsTable)
      .where(and(eq(emailOtpsTable.email, email), eq(emailOtpsTable.otp, otp)))
      .returning()

    return deleted[0] ?? null
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function DeleteOtpByEmail(email: string) {
  try {
    return await db
      .delete(emailOtpsTable)
      .where(eq(emailOtpsTable.email, email))
      .returning()
  } catch (e: any) {
    throw new Error(e.message)
  }
}
