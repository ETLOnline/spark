'use server'

import { CreateEvent, DeleteEvent, GetEvents, UpdateEvents } from "@/src/db/data-access/events/query";
import { CreateServerAction } from "..";
import { InsertEvent, SelectEvent} from "@/src/db/schema";
import { start } from "repl";

export const CreateEventAction = CreateServerAction( true, async (eventData: InsertEvent) => {
    try{
      const newEvent = await CreateEvent(eventData);
        return { success: true, data : newEvent }
    }catch(error){
        return { error: error }
    }
})

export const GetEventsAction = CreateServerAction( false, async (startDate, endDate)=>{
  try{
    const events = await GetEvents(startDate, endDate);
    return { success: true, data: events }
  }catch(error){
    return { error: error }
  }
})

export const UpdateEventsAction = CreateServerAction( true, async (eventId: number,updatedEventsData: Partial<SelectEvent>)=>{
  try{
    const updatedEvents = await UpdateEvents(eventId, updatedEventsData)
    return { success: true, data: updatedEvents}
  }catch(error){
    return { error: error}
  }
}
)


export const DeleteEventAction = CreateServerAction( true, async (deleteEventData: SelectEvent)=>{
  try{
     await DeleteEvent(deleteEventData)
    return{success: true}
  }catch(error){
    return { error: error}
  }
})
