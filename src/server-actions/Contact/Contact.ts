"use server"

import {
  CreateContact,
  DeleteContact,
  GetConnectionRequests,
  GetContact,
  GetContacts,
  UpdateContact
} from "@/src/db/data-access/contact/query"
import { CreateServerAction } from ".."

export const CreateContactAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      await CreateContact(user_id, contact_id)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AcceptConnectionAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      await UpdateContact(contact_id, user_id, {
        is_accepted: 1
      })
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteContactAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string, contactType: string) => {
    try {
      await DeleteContact(user_id, contact_id, contactType)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetContactsAction = CreateServerAction(
  true,
  async (user_id: string) => {
    try {
      const contacts = await GetContacts(user_id)
      return { success: true, data: contacts }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetContactAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      const contact = await GetContact(user_id, contact_id)
      return { success: true, data: contact }
    } catch (error) {
      return { error: error, data: null }
    }
  }
)

export const GetConnectionRequestsAction = CreateServerAction(
  true,
  async (user_id: string) => {
    try {
      const connectionReqs = await GetConnectionRequests(user_id)
      return { success: true, data: connectionReqs }
    } catch (error) {
      return { error: error, success: false }
    }
  }
)
