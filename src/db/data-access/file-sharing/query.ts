import { and, eq } from "drizzle-orm"
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

export async function checkFileInDirectory(fileId: number) {
  const result = await db
    .select()
    .from(spaceFileDirectoryTable)
    .where(
      and(
        eq(spaceFileDirectoryTable.entity_id, fileId),
        eq(spaceFileDirectoryTable.entity_type, "file")
      )
    )
    .limit(1)

  if (!result.length) {
    throw new Error("File not found in directory structure")
  }

  return result[0]
}

export async function DeleteFolder(id: string | number, folderName: string) {
  try {
    const result = await db
      .delete(spaceFileDirectoryTable)
      .where(
        and(
          typeof id === "string"
            ? eq(spaceFileDirectoryTable.space_id, id)
            : eq(spaceFileDirectoryTable.parent_id, id),
          eq(spaceFileDirectoryTable.entity_name, folderName),
          eq(spaceFileDirectoryTable.entity_type, "folder")
        )
      )
      .returning()

    return result
  } catch (error) {
    console.error("Error deleting folder from database:", error)
    throw new Error("Failed to delete folder from database")
  }
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

export async function DeleteFile(id: string | number, fileName: string) {
  return await db
    .delete(spaceFileDirectoryTable)
    .where(
      and(
        typeof id === "string"
          ? eq(spaceFileDirectoryTable.space_id, id)
          : eq(spaceFileDirectoryTable.parent_id, id),
        eq(spaceFileDirectoryTable.entity_name, fileName),
        eq(spaceFileDirectoryTable.entity_type, "file")
      )
    )
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

export async function deleteFileFromDirectory(fileId: number) {
  const result = await db
    .delete(spaceFileDirectoryTable)
    .where(
      and(
        eq(spaceFileDirectoryTable.entity_id, fileId),
        eq(spaceFileDirectoryTable.entity_type, "file")
      )
    )

  if (result.rowsAffected === 0) {
    console.error("No rows affected in directory table deletion")
    return { success: false }
  }

  return { success: true }
}
