import { and, desc, eq, gte, lt, lte } from "drizzle-orm"
import { db } from "../.."
import { emailTemplatesTable } from "../../schema"

export async function getEmailTemplateByName(name: string) {
  try {
    const template = await db
      .select()
      .from(emailTemplatesTable)
      .where(and(eq(emailTemplatesTable.name, name)))
    return template[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}
