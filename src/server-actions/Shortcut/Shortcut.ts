"use server"

import {
  AddShortcut,
  DeleteShortcut,
  GetUserShortcuts,
  GetUserShortcutsByRelations
} from "@/src/db/data-access/shortcuts/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { InsertShortcut } from "@/src/db/schema"

export const getUserShortcutsAction = CreateServerAction(true, async () => {
  try {
    const user = await AuthUserAction();
    const shortcuts = await GetUserShortcutsByRelations(user.unique_id);

    const formattedData = (Array.isArray(shortcuts) ? shortcuts : [shortcuts]).map(s => {
      let resolvedTitle: string; // Explicitly a string

      switch (s.type) {
        case 'community':
          resolvedTitle = s.community?.title ?? 'Unnamed Community';
          break;
        case 'channel':
          resolvedTitle = s.channel?.channel_name ?? 'Unnamed Channel';
          break;
        case 'space':
          resolvedTitle = s.space?.space_name ?? 'Unnamed Space';
          break;
        case 'project':
          resolvedTitle = s.project?.project_name ?? 'Unnamed Project';
          break;
        default:
          resolvedTitle = 'Unnamed Shortcut';
      }

      return {
        ...s,
        title: resolvedTitle // Now TS is happy because resolvedTitle cannot be undefined
      };
    });

    return { success: true, data: formattedData };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch user shortcuts"
    };
  }
});

export const createShortcutAction = CreateServerAction(
  true,
  async (shortcutData: Partial<InsertShortcut>) => {
    try {
      const user = await AuthUserAction()
      shortcutData.user_id = user.unique_id
      const shortcut = await AddShortcut(shortcutData as InsertShortcut)
      return { success: true, data: shortcut }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to add shortcut"
      }
    }
  }
)

export const deleteShortcutAction = CreateServerAction(
  true,
  async (shortcutId: string) => {
    try {
      await DeleteShortcut(shortcutId)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to delete shortcut"
      }
    }
  }
)
