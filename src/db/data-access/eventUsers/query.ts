import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { eventRegistrationsTable, InsertEventRegistration } from "../../schema"

export async function CreateEventUser(eventUserData: InsertEventRegistration) {
  try {
    // Check if already registered
    const existingUser = await db
      .select()
      .from(eventRegistrationsTable)
      .where(
        and(
          eq(eventRegistrationsTable.event_id, eventUserData.event_id),
          eq(eventRegistrationsTable.user_id, eventUserData.user_id)
        )
      )

    if (existingUser.length > 0) {
      return { error: "User is already registered for this event." }
    }

    const newEventUser = await db
      .insert(eventRegistrationsTable)
      .values(eventUserData)
      .returning()

    return { data: newEventUser }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetEventUserByIds(event_id: number, user_id: string) {
  try {
    const existingUser = await db
      .select()
      .from(eventRegistrationsTable)
      .where(
        and(
          eq(eventRegistrationsTable.event_id, event_id),
          eq(eventRegistrationsTable.user_id, user_id)
        )
      )

    return existingUser
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetEventAttendees(event_id: number) {
  try {
    const attendees = await db.query.eventRegistrationsTable.findMany({
      where: (eventUser, { eq }) => eq(eventUser.event_id, event_id),
      with: {
        user: {
          with: {
            roles: {
              with: {
                role: true
              }
            }
          }
        }
      }
    })

    return attendees
  } catch (e: any) {
    throw new Error(e.message)
  }
}
