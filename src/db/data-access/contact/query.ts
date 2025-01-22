import { and, eq, or } from "drizzle-orm"
import { db } from "../.."
import { SelectUserContact, userContactsTable } from "../../schema"

export const CreateContact = async (user_id: string, contact_id: string) => {
  try {
    return await db
      .insert(userContactsTable)
      .values({ user_id, contact_id, is_requested: 1 })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const UpdateContact = async (
  user_id: string,
  contact_id: string,
  payload: Partial<SelectUserContact>
) => {
  try {
    return await db
      .update(userContactsTable)
      .set(payload)
      .where(
        and(
          eq(userContactsTable.contact_id, contact_id),
          eq(userContactsTable.user_id, user_id)
        )
      )
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const DeleteContact = async (user_id: string, contact_id: string) => {
  try {
    return await db
      .delete(userContactsTable)
      .where(
        and(
          eq(userContactsTable.contact_id, contact_id),
          eq(userContactsTable.user_id, user_id)
        )
      )
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetIncomingConnectionRequests = async (user_id: string) => {
  try {
    return await db.query.userContactsTable.findMany({
      where: and(
        or(
          eq(userContactsTable.is_accepted, 1),
          eq(userContactsTable.is_requested, 1)
        ),
        eq(userContactsTable.contact_id, user_id)
      ),
      with: {
        user: true
      }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetOutgoingConnectionRequests = async (user_id: string) => {
  try {
    return await db.query.userContactsTable.findMany({
      where: and(
        or(
          eq(userContactsTable.is_accepted, 1),
          eq(userContactsTable.is_requested, 1)
        ),
        eq(userContactsTable.user_id, user_id)
      ),
      with: {
        contact: true
      }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}
