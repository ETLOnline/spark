import { db } from "../.."
import { filesTable, InsertFile } from "../../schema"

export const AddFile = async (file: InsertFile) => {
  return await db.insert(filesTable).values(file).returning()
}
