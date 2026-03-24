import { db } from "@/src/db" 
import { invitationsTable, InsertInvitation } from "@/src/db/schema"
import { randomBytes } from "crypto"
import { and, eq, sql } from "drizzle-orm"


export async function createInvitation(data: {
    invite_key: string
    invite_email: string[]
    invited_by: string
    role_offer_id : number
    entity_id: string,
    entity_type: string
  }) {
    try {
      const newInvitation = await db
        .insert(invitationsTable)
        .values({
          ...data,
          joined_email: [],
        })
        .returning()
  
      if (!newInvitation[0]) {
        throw new Error("Failed to create invitation: No record returned.")
      }
  
      return newInvitation[0]
    } catch (e: any) {
      console.error("Error creating invitation:", e)
      throw new Error(`Failed to create invitation: ${e.message}`)
    }
  }

  export async function getValidInvitationWithRole(key: string, userEmail: string) {
    try {
      return await db.query.invitationsTable.findFirst({
        where: and(
          eq(invitationsTable.invite_key, key),
          sql`${invitationsTable.invite_email} @> ${JSON.stringify([userEmail])}::jsonb`
        ),
        with: {
          role: true 
        }
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  export async function updateJoinedEmail(inviteKey: string, email: string) {
    return await db
      .update(invitationsTable)
      .set({
        joined_email: sql`${invitationsTable.joined_email} || ${JSON.stringify([email])}::jsonb`
      })
      .where(eq(invitationsTable.invite_key, inviteKey))
      .returning();
  }