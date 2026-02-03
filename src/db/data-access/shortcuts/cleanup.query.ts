
import { db } from "@/src/db/index";
import { eq, inArray } from "drizzle-orm";
import { RawShortcut, ShortcutEntityType } from "@/src/services/cleanup/shortcuts/cleanup.types";
import { channelsTable, communitiesTable, projectTable, shortcutsTable, spacesTable } from "../../schema";

const VALID_TYPES: Set<string> = new Set<ShortcutEntityType>([
  "community",
  "channel",
  "space",
  "project",
]);
export type ParentLevel = "community" | "channel" | "space";

function isValidType(value: string): value is ShortcutEntityType {
  return VALID_TYPES.has(value);
}

export async function getAllShortcuts(): Promise<RawShortcut[]> {
  const rows = await db
    .select({
      id: shortcutsTable.id,
      type: shortcutsTable.type,
      entity_id: shortcutsTable.entity_id,
    })
    .from(shortcutsTable);

  return rows.filter((row): row is RawShortcut => {
    if (!row.entity_id) return false;
    if (!isValidType(row.type)) return false;
    return true;
  });
}

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
        
        entityIds.push(...projects.map(proj => proj.id));
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
      
      entityIds.push(...projects.map(proj => proj.id));
    }
  } else if (parentLevel === "space") {
    const projects = await db
      .select({ id: projectTable.id })
      .from(projectTable)
      .where(eq(projectTable.space_id, parentId));
    
    entityIds.push(...projects.map(proj => proj.id));
  }

  return entityIds;
}


export async function deleteShortcutsByEntityIds(entityIds: string[]): Promise<number> {
  if (entityIds.length === 0) return 0;
  const result = await db.delete(shortcutsTable).where(inArray(shortcutsTable.entity_id, entityIds));
  return entityIds.length; 
}

export async function communityExists(id: string) {
  const row = await db.select({ id: communitiesTable.id }).from(communitiesTable).where(eq(communitiesTable.id, id)).limit(1);
  return row.length > 0;
}
export async function channelExists(id: string) {
  const row = await db.select({ id: channelsTable.id }).from(channelsTable).where(eq(channelsTable.id, id)).limit(1);
  return row.length > 0;
}
export async function spaceExists(id: string) {
  const row = await db.select({ id: spacesTable.id }).from(spacesTable).where(eq(spacesTable.id, id)).limit(1);
  return row.length > 0;
}
export async function projectExists(id: string) {
  const row = await db.select({ id: projectTable.id }).from(projectTable).where(eq(projectTable.id, id)).limit(1);
  return row.length > 0;
}