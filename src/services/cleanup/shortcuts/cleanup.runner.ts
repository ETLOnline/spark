
import { ENTITY_CHECKERS } from "./cleanup.checkers";
import { 
  getAllShortcuts, 
  getChildEntityIds, 
  deleteShortcutsByEntityIds 
} from "@/src/db/data-access/shortcuts/cleanup.query";
import { CleanupReport, ParentLevel } from "./cleanup.types";
import pusherServer from "../../realtime/pusherServer";

export async function runOrphanCleanup(): Promise<CleanupReport> {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let totalDeleted = 0;
  
  try {
    const allShortcuts = await getAllShortcuts();
    const processedEntityIds = new Set<string>();

    for (const shortcut of allShortcuts) {
      if (processedEntityIds.has(shortcut.entity_id)) continue;

      const checker = ENTITY_CHECKERS[shortcut.type];
      if (!checker) continue;

      const exists = await checker(shortcut.entity_id);

      if (!exists) {
        let childIds: string[] = [];
        if (shortcut.type !== "project") {
          childIds = await getChildEntityIds(shortcut.type as ParentLevel, shortcut.entity_id);
        } else {
          childIds = [shortcut.entity_id];
        }

        const count = await deleteShortcutsByEntityIds(childIds);
        totalDeleted += count;

        if (count > 0) {
          await pusherServer.trigger(
            "broadcast-entity-delete-sidebar",
            `${shortcut.type}-delete`,
            { 
              [`${shortcut.type}Id`]: shortcut.entity_id, 
              childIds 
            }
          );
        }

        childIds.forEach(id => processedEntityIds.add(id));
      }
    }

    return {
      startedAt,
      finishedAt: new Date().toISOString(),
      totalChecked: allShortcuts.length,
      totalDeleted,
      errors,
    };

  } catch (err) {
    return {
      startedAt,
      finishedAt: new Date().toISOString(),
      totalChecked: 0,
      totalDeleted: 0,
      errors: [err instanceof Error ? err.message : "Unknown error in runner"],
    };
  }
}