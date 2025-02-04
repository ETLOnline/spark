import { and, desc, eq, gte, lt, lte } from "drizzle-orm";
import { db } from "../..";
import { eventsTable, InsertEvent, SelectEvent } from "../../schema";

export async function CreateEvent(eventData: InsertEvent){
  try{
    const newEvent = await db.insert(eventsTable).values(eventData).returning()
    return newEvent[0]
  }catch(e:any){
    throw new Error(e.message)
  }
}

export async function GetEvents(startDate: string, endDate: string){
  try{
    const events = await db.select().from(eventsTable)
      .where(
        and(
          gte(eventsTable.end_date_time, startDate),
          lte(eventsTable.end_date_time, endDate)
        )
      ) 
      .orderBy(desc(eventsTable.start_date_time)); 
    return events;
  }catch(e:any){
    throw new Error(e.message)
  }
}


export async function UpdateEvents(updatedEventsData: InsertEvent){
  try{
    if (updatedEventsData.id === undefined) {
      throw new Error();
    }
    const updatedEvents = await db.update(eventsTable).set(updatedEventsData)
    .where( eq(eventsTable.id, updatedEventsData.id))
    .returning()
    return updatedEvents[0]
  }catch(e:any){
    throw new Error(e.message)
  }
}

export async function DeleteEvent(deleteEventsData: SelectEvent) {
  try{
    const DeletedEvent = await db.delete(eventsTable)
    .where( eq(eventsTable.id, deleteEventsData.id))
    return deleteEventsData
  }catch(e:any){
    throw new Error(e.message)
  }
  
}