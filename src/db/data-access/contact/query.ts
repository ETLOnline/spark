import { usersTable } from "./../../schema"
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

export const DeleteContact = async (
  user_id: string,
  contact_id: string,
  contactType: string
) => {
  try {
    return await db
      .delete(userContactsTable)
      .where(
        and(
          eq(userContactsTable.contact_id, contact_id),
          eq(userContactsTable.user_id, user_id),
          contactType === "is_requested"
            ? eq(userContactsTable.is_requested, 1)
            : contactType === "is_accepted"
            ? eq(userContactsTable.is_accepted, 1)
            : contactType === "is_blocked"
            ? eq(userContactsTable.is_blocked, 1)
            : contactType === "is_following"
            ? eq(userContactsTable.is_following, 1)
            : eq(userContactsTable.is_followed_by, 1)
        )
      )
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetConnectionRequests = async (user_id: string) => {
  try {
    return await db.query.usersTable.findFirst({
      where: eq(usersTable.unique_id, user_id),
      with: {
        contacts: {
          where: and(
            or(
              eq(userContactsTable.is_requested, 1),
              eq(userContactsTable.is_accepted, 1)
            ),
            or(
              eq(userContactsTable.contact_id, user_id),
              eq(userContactsTable.user_id, user_id)
            )
          ),
          with: {
            user: true
          }
        }
      }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// export const GetConnectionRequestsSent = async (user_id: string) => {
//   try {
//     return await db.query.usersTable.findFirst({
//       where: eq(usersTable.unique_id, user_id),
//       with: {
//         contacts: {
//           where: and(
//             eq(userContactsTable.is_requested, 1),
//             eq(userContactsTable.is_accepted, 0),
//             eq(userContactsTable.contact_id, user_id)
//           ),
//           with: {
//             user: true
//           }
//         }
//       }
//     })
//   } catch (error: any) {
//     throw new Error(error.message)
//   }
// }
