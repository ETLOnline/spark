// src/db/data-access/persona/query.ts
import { db } from "@/src/db"
import { personasTable, usersTable } from "@/src/db/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, sql } from "drizzle-orm"

// Get all personas (standardized response)
export const getAllPersonas = async () => {
  try {
    const personas = await db
      .select()
      .from(personasTable)
      .where(eq(personasTable.status, "active"))
    return { success: true, data: personas }
  } catch (error) {
    console.error("Error fetching personas:", error)
    return { success: false, error: "Error fetching personas." }
  }
}

// Get single persona by key (optional)
export const getPersonaByKey = async (key: string) => {
  try {
    const persona = await db.query.personasTable.findFirst({
      where: (p, { eq }) => eq(p.slug, key)
    })
    return { success: true, data: persona }
  } catch (error) {
    console.error("Error fetching persona by key:", error)
    return { success: false, error: "Error fetching persona by key." }
  }
}

export const savePersona = async (personaID: number, userId: string) => {
  try {
    const result = await db
      .update(usersTable)
      .set({
        persona_id: personaID,
        meta_profile: sql`jsonb_set("meta_profile"::jsonb, '{persona_selected}', 'true', true)`
      })
      .where(eq(usersTable.external_auth_id, userId))
      .returning()

    return result[0]
  } catch (error) {
    console.error("Error fetching persona by key:", error)
    return { success: false, error: "Error fetching persona by key." }
  }
}
