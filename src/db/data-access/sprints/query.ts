import { eq } from "drizzle-orm"
import { db } from "../.."
import { SelectSprint, SprintTable } from "../../schema"

export async function CreateSprint(sprintData: SelectSprint) {
  try {
    const sprint = await db.insert(SprintTable).values(sprintData).returning()

    return sprint[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getSprints(projectId: string) {
  try {
    const sprints = await db
      .select()
      .from(SprintTable)
      .where(eq(SprintTable.projectId, projectId))

    return sprints
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateSprint(
  sprintId: string,
  sprintData: Partial<SelectSprint>
) {
  try {
    const UpdatedSprint = await db
      .update(SprintTable)
      .set(sprintData)
      .where(eq(SprintTable.id, sprintId))
      .returning()

    return UpdatedSprint[0]
  } catch (e: any) {
    throw new Error(e.messege)
  }
}

export async function DeleteSprint(sprintId: string) {
  try {
    await db.delete(SprintTable).where(eq(SprintTable.id, sprintId))
  } catch (e: any) {
    throw new Error(e.message)
  }
}
