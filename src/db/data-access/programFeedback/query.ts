import { and, eq } from "drizzle-orm"
import { db } from "../.."
import {
  InsertProgramFeedback,
  programFeedbackTable,
  SelectProgramFeedback
} from "../../schema"

export const GetProgramFeedbackBySpaceAndUser = async (
  spaceId: string,
  userId: string
): Promise<SelectProgramFeedback | null> => {
  const [row] = await db
    .select()
    .from(programFeedbackTable)
    .where(
      and(
        eq(programFeedbackTable.space_id, spaceId),
        eq(programFeedbackTable.submitted_by, userId)
      )
    )
  return row ?? null
}

export const GetProgramFeedbackForSpace = async (
  spaceId: string
): Promise<SelectProgramFeedback[]> => {
  return db
    .select()
    .from(programFeedbackTable)
    .where(eq(programFeedbackTable.space_id, spaceId))
}

export const CreateProgramFeedback = async (
  data: InsertProgramFeedback
): Promise<SelectProgramFeedback> => {
  const [row] = await db.insert(programFeedbackTable).values(data).returning()
  return row
}
