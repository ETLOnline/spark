import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { InsertSkill, skillsTable } from "../../schema"

export const AddSkill = async (data: InsertSkill) => {
  return await db.insert(skillsTable).values(data).returning()
}

export const DeleteSkill = async (userId: string, skillName: string) => {
  return await db
    .delete(skillsTable)
    .where(and(eq(skillsTable.user, userId), eq(skillsTable.name, skillName)))
    .returning()
}
