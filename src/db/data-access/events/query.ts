import { and, desc, eq, gte, lt, lte } from "drizzle-orm"
import { db } from "../.."
import {
  eventRegistrationsTable,
  eventsTable,
  InsertEvent,
  SelectEvent
} from "../../schema"
import { usersTable } from "../../schema"

export async function CreateEvent(eventData: InsertEvent) {
  try {
    const newEvent = await db.insert(eventsTable).values(eventData).returning()
    return newEvent[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetEvents(startDate: string, endDate: string) {
  try {
    const events = await db.query.eventsTable.findMany({
      with: {
        host: true
      },
      where: and(
        gte(eventsTable.end_date_time, startDate),
        lte(eventsTable.end_date_time, endDate)
      ),
      orderBy: desc(eventsTable.start_date_time)
    })
    return events
  } catch (e: any) {
    throw new Error(e.message)
  }
}
export async function GetEventById(eventId: number) {
  try {
    const event = await db.query.eventsTable.findMany({
      with: {
        host: true
      },
      where: eq(eventsTable.id, eventId)
    })
    return event
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateEvents(
  eventId: number,
  updatedEventsData: Partial<SelectEvent>
) {
  try {
    const updatedEvents = await db
      .update(eventsTable)
      .set(updatedEventsData)
      .where(eq(eventsTable.id, eventId))
      .returning()
    return updatedEvents[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}
export async function DeleteEvent(deleteEventsData: SelectEvent) {
  try {
    return await db
      .delete(eventsTable)
      .where(eq(eventsTable.id, deleteEventsData.id))
      .returning()
  } catch (e: any) {
    throw new Error(`Failed to delete event: ${e.message}`)
  }
}
