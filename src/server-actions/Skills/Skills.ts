"use server"

import { InsertSkill } from "../../db/schema"
import { CreateServerAction } from ".."
import { AddSkill, DeleteSkill } from "@/src/db/data-access/skills/query"

export const AddSkillForUser = CreateServerAction(
  false,
  async (skillData: InsertSkill) => {
    try {
      const data = await AddSkill(skillData)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export const DeleteSkillForUser = CreateServerAction(
  false,
  async (userId: string, skillName: string) => {
    try {
      const data = await DeleteSkill(userId, skillName)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export type SkillAdder = typeof AddSkillForUser
export type SkillDeleter = typeof DeleteSkillForUser
