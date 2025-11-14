import { and, eq, isNull, like } from "drizzle-orm"
import { db } from "../.."
import { spaceFileDirectoryTable, filesTable } from "../../schema"
import { space } from "postcss/lib/list"

export async function CreateFolder(
  id: string | number,
  folderName: string,
  folderSlug: string
) {
  return await db
    .insert(spaceFileDirectoryTable)
    .values({
      space_id: typeof id === "string" ? id : undefined,
      parent_id: typeof id === "number" ? id : undefined,
      entity_name: folderName,
      entity_type: "folder",
      entity_slug: folderSlug
    })
    .returning()
}

export const searchFoldersBySlug = async (
  id: string | number,
  folderSlug: string,
  isRoot: boolean
) => {
  try {
    const folder = await db
      .select()
      .from(spaceFileDirectoryTable)
      .where(
        and(
          eq(spaceFileDirectoryTable.entity_slug, folderSlug),
          isRoot
            ? eq(spaceFileDirectoryTable.space_id, id as string)
            : eq(spaceFileDirectoryTable.parent_id, id as number)
        )
      )

    return folder
  } catch (error) {
    console.error("Error getting folder by slug:", error)
  }
}

export async function searchDirectoryContents(
  id: string | number,
  searchQuery: string
) {
  const searchPattern = `%${searchQuery.trim()}%`

  const whereClause =
    typeof id === "string"
      ? and(
          eq(spaceFileDirectoryTable.space_id, id),
          like(spaceFileDirectoryTable.entity_name, searchPattern)
        )
      : and(
          eq(spaceFileDirectoryTable.parent_id, id),
          like(spaceFileDirectoryTable.entity_name, searchPattern)
        )

  return await db.query.spaceFileDirectoryTable.findMany({
    where: whereClause,
    with: {
      file: true
    }
  })
}

export async function CreateFile(
  id: string | number,
  fileName: string,
  fileSize: number,
  fileId: number,
  createdBy: string
) {
  return await db
    .insert(spaceFileDirectoryTable)
    .values({
      space_id: typeof id === "string" ? id : undefined,
      parent_id: typeof id === "number" ? id : undefined,
      entity_name: fileName,
      entity_type: "file",
      entity_size: fileSize,
      entity_id: fileId,
      created_by: createdBy
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

export async function DeleteFile(fileId: number) {
  // First get the file info to delete from storage
  const fileEntry = await db.query.spaceFileDirectoryTable.findFirst({
    where: eq(spaceFileDirectoryTable.id, fileId),
    with: {
      file: true
    }
  })

  if (!fileEntry || fileEntry.entity_type !== "file") {
    throw new Error("File not found")
  }

  // Delete from directory table
  await db
    .delete(spaceFileDirectoryTable)
    .where(eq(spaceFileDirectoryTable.id, fileId))

  // Delete from files table if entity_id exists
  if (fileEntry.entity_id) {
    await db.delete(filesTable).where(eq(filesTable.id, fileEntry.entity_id))
  }

  return fileEntry
}
