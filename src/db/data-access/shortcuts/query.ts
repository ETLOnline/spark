import { eq, inArray } from "drizzle-orm"
import { db } from "../.."
import { channelsTable, InsertShortcut, projectTable, shortcutsTable, spacesTable } from "../../schema"

export const AddShortcut = async (data: InsertShortcut) => {
  try {
    return (await db.insert(shortcutsTable).values(data).returning()).at(0)
  } catch (e: any) {
    throw new Error("Failed to add shortcut", {
      cause: e
    })
  }
}

export const DeleteShortcut = async (shortcutId: string) => {
  try {
    return await db
      .delete(shortcutsTable)
      .where(eq(shortcutsTable.id, shortcutId))
  } catch (e: any) {
    throw new Error("Failed to delete shortcut", {
      cause: e
    })
  }
}

export const GetUserShortcuts = async (userId: string) => {
  try {
    return await db
      .select()
      .from(shortcutsTable)
      .where(eq(shortcutsTable.user_id, userId))
  } catch (e: any) {
    throw new Error("Failed to get shortcuts", {
      cause: e
    })
  }
}

export const GetUserShortcutsByRelations = async (userId: string) => {
  try {
    return await db.query.shortcutsTable.findMany({
      where: eq(shortcutsTable.user_id, userId),
      with: {
        community: { columns: { id:true,title: true , slug:true} },
        channel: { columns: { id:true, channel_name: true , channel_slug:true} },
        space: { columns: { id:true,space_name: true , space_slug:true} },
        project: { columns: { id:true,project_name: true, project_slug:true } },
      },
    });
  } catch (e: any) {
    throw new Error("Failed to get shortcuts", { cause: e });
  }
};

export type ParentLevel = "community" | "channel" | "space";

export async function getChildEntityIds(
  parentLevel: ParentLevel,
  parentId: string
): Promise<string[]> {
  const entityIds: string[] = [parentId];

  if (parentLevel === "community") {
    const channels = await db
      .select({ id: channelsTable.id })
      .from(channelsTable)
      .where(eq(channelsTable.community_id, parentId));
    
    const channelIds = channels.map(ch => ch.id);
    entityIds.push(...channelIds);

    if (channelIds.length > 0) {
      const spaces = await db
        .select({ id: spacesTable.id })
        .from(spacesTable)
        .where(inArray(spacesTable.channel_id, channelIds));
      
      const spaceIds = spaces.map(sp => sp.id);
      entityIds.push(...spaceIds);

      if (spaceIds.length > 0) {
        const projects = await db
          .select({ id: projectTable.id })
          .from(projectTable)
          .where(inArray(projectTable.space_id, spaceIds));
        
        const projectIds = projects.map(proj => proj.id);
        entityIds.push(...projectIds);
      }
    }
  } else if (parentLevel === "channel") {
    const spaces = await db
      .select({ id: spacesTable.id })
      .from(spacesTable)
      .where(eq(spacesTable.channel_id, parentId));
    
    const spaceIds = spaces.map(sp => sp.id);
    entityIds.push(...spaceIds);

    if (spaceIds.length > 0) {
      const projects = await db
        .select({ id: projectTable.id })
        .from(projectTable)
        .where(inArray(projectTable.space_id, spaceIds));
      
      const projectIds = projects.map(proj => proj.id);
      entityIds.push(...projectIds);
    }
  } else if (parentLevel === "space") {
    const projects = await db
      .select({ id: projectTable.id })
      .from(projectTable)
      .where(eq(projectTable.space_id, parentId));
    
    const projectIds = projects.map(proj => proj.id);
    entityIds.push(...projectIds);
  }

  return entityIds;
}

export const DeleteShortcutsCascade = async (
  parentLevel: ParentLevel,
  parentId: string
) => {
  try {
    const entityIdsToDelete = await getChildEntityIds(parentLevel, parentId);

    if (entityIdsToDelete.length > 0) {
      return await db
        .delete(shortcutsTable)
        .where(
          inArray(shortcutsTable.entity_id, entityIdsToDelete)
        );
    }

    return { count: 0 };
  } catch (e: any) {
    throw new Error(`Failed to delete ${parentLevel} shortcuts cascade`, {
      cause: e
    });
  }
};