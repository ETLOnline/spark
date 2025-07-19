"use server"

import {
  AddShortcut,
  DeleteShortcut,
  GetUserShortcuts
} from "@/src/db/data-access/shortcuts/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { InsertShortcut } from "@/src/db/schema"

export const getUserShortcutsAction = CreateServerAction(true, async () => {
  try {
    const user = await AuthUserAction()
    const shortcuts = await GetUserShortcuts(user.unique_id)
    return { success: true, data: shortcuts }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch user shortcuts"
    }
  }
})

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
