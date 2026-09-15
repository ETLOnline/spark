import { desc, eq } from "drizzle-orm"
import { db } from "../.."
import { momsTable, InsertMom } from "../../schema"

export const CreateMom = async (data: InsertMom) => {
  try {
    return await db.insert(momsTable).values(data).returning()
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const GetMomsForSpace = async (spaceId: string) => {
  try {
    return await db.query.momsTable.findMany({
      where: eq(momsTable.space_id, spaceId),
      orderBy: [
        desc(momsTable.meeting_date),
        desc(momsTable.meeting_start_time)
      ]
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const GetMomById = async (id: string) => {
  try {
    const mom = await db.query.momsTable.findFirst({
      where: eq(momsTable.id, id)
    })
    return mom ?? null
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const DeleteMom = async (id: string) => {
  try {
    const [deleted] = await db
      .delete(momsTable)
      .where(eq(momsTable.id, id))
      .returning()
    return deleted ?? null
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const UpdateMom = async (
  id: string,
  data: Partial<Omit<InsertMom, "id" | "space_id" | "created_by">>
) => {
  try {
    const [updated] = await db
      .update(momsTable)
      .set(data)
      .where(eq(momsTable.id, id))
      .returning()
    return updated ?? null
  } catch (e: any) {
    throw new Error(e.message)
  }
}
