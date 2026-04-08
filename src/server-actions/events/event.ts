"use server"

import {
  CreateEvent,
  DeleteEvent,
  GetEventById,
  GetEvents,
  UpdateEvents
} from "@/src/db/data-access/events/query"
import { CreateServerAction } from ".."
import { InsertEvent, SelectEvent } from "@/src/db/schema"
import { start } from "repl"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { AddRewardAction } from "../Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"

export const CreateEventAction = CreateServerAction(
  true,
  async (eventData: InsertEvent) => {
    try {
      const newEvent = await CreateEvent(eventData)
      await AddRewardAction(ActivityTypes.EventCreation, eventData.host_id, createAbsoluteUrl(`/events/${newEvent.id}`))
      return { success: true, data: newEvent }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetEventsAction = CreateServerAction(
  false,
  async (startDate, endDate) => {
    try {
      const events = await GetEvents(startDate, endDate)
      return { success: true, data: events }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetEventByIdAction = CreateServerAction(
  true,
  async (eventId: number) => {
    try {
      const event = await GetEventById(eventId)
      return { success: true, data: event }
    } catch (error) {
      return { error }
    }
  }
)

export const UpdateEventsAction = CreateServerAction(
  true,
  async (eventId: number, updatedEventsData: Partial<SelectEvent>) => {
    try {
      const updatedEvents = await UpdateEvents(eventId, updatedEventsData)
      return { success: true, data: updatedEvents }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteEventAction = CreateServerAction(
  true,
  async (deleteEventData: SelectEvent) => {
    try {
      await DeleteEvent(deleteEventData)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)
export const UploadEventImageAction = CreateServerAction(
  true,
  async (fileName: string, fileB64string: string, fileType: string) => {
    try {
      const fileBuffer = base64ToBuffer(fileB64string)

      const { fileUrl, fileRecord } = await uploadFileAndSaveMetadata(
        fileBuffer,
        fileName,
        fileType,
        "events"
      )

      if (!fileUrl || !fileRecord) {
        throw new Error("Upload failed: missing fileUrl or file metadata.")
      }

      return {
        success: true,
        data: fileUrl
      }
    } catch (error: any) {
      console.error("Error uploading event image:", error)
      return {
        success: false,
        error: error.message || "Failed to upload event image"
      }
    }
  }
)
