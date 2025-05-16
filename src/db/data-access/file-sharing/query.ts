import { eq } from "drizzle-orm"
import { db } from "../.."
import { spaceFileDirectoryTable } from "../../schema"

export async function CreateFolder(id: string | number, folderName: string) {
  return await db
    .insert(spaceFileDirectoryTable)
    .values({
      space_id: typeof id === "string" ? id : undefined,
      parent_id: typeof id === "number" ? id : undefined,
      entity_name: folderName,
      entity_type: "folder"
    })
    .returning()
}

export async function CreateFile(
  id: string | number,
  fileName: string,
  fileSize: number,
  fileId: number
) {
  return await db
    .insert(spaceFileDirectoryTable)
    .values({
      space_id: typeof id === "string" ? id : undefined,
      parent_id: typeof id === "number" ? id : undefined,
      entity_name: fileName,
      entity_type: "file",
      entity_size: fileSize,
      entity_id: fileId
    })
    .returning()
}

export async function GetDirectoryContents(id: string | number) {
  return await db.query.spaceFileDirectoryTable.findMany({
    where:
      typeof id === "string"
        ? eq(spaceFileDirectoryTable.space_id, id)
        : eq(spaceFileDirectoryTable.parent_id, id),
    with: {
      file: true
    }
  })
}