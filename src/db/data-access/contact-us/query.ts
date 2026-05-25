import { db } from "../.."
import { contactUsTable, InsertContactUs } from "../../schema"

export async function CreateContactUs(data: InsertContactUs) {
  const result = await db.insert(contactUsTable).values(data).returning()
  return result[0]
}
