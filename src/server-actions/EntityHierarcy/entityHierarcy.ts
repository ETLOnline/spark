"use server"
import { getHierarchy } from "@/src/db/data-access/EntityHierarcy/query"
import { CreateServerAction } from ".."

export const GetEntityHierarchyAction = CreateServerAction(
  true,
  async (type: string, id: string) => {
    try {
      const hierarchy = await getHierarchy(type, id)
      return { success: true, data: hierarchy }
    } catch (error) {
      return { error: error }
    }
  }
)
