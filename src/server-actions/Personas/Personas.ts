// src/actions/persona/getPersonasAction.ts
"use server"

import {
  getAllPersonas,
  savePersona
} from "@/src/db/data-access/personas/query"
import { CreateServerAction } from ".."

export const getPersonasAction = async () => {
  // Just return the result from getAllPersonas directly
  return await getAllPersonas()
}

export const savePersonaAction = CreateServerAction(
  true,
  async (personaID: number, userId: string) => {
    try {
      const attachPersona = await savePersona(personaID, userId)
      return { success: true, data: attachPersona }
    } catch (error) {
      console.error("Error saving persona:", error)
      return { success: false, error: "Failed to save persona" }
    }
  }
)
