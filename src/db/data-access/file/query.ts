import { eq } from "drizzle-orm"
import { db } from "../.."
import { filesTable, InsertFile } from "../../schema"

export const AddFile = async (file: InsertFile) => {
  return await db.insert(filesTable).values(file).returning()
}

export async function getFileById(id: number) {
  const file = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.id, id))
    .limit(1)

  if (!file.length) {
    throw new Error("File not found")
  }

  return file[0]
}




export const deleteFile = async (id: number) => {
  return await db.delete(filesTable).where(eq(filesTable.id, id)).returning()
}
