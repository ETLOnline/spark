"use server"

import { CreateServerAction } from ".."
import { db } from "@/src/db"
import { mentorRelationshipsTable, mentorFavoritesTable, usersTable } from "@/src/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export interface ConnectionRequestData {
  mentorId: string
  message?: string
}

export interface FavoriteToggleData {
  mentorId: string
}

export const GetMentorConnectionStatusAction = CreateServerAction(
  true,
  async (mentorId: string) => {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error("User not authenticated")
    }

    try {
     
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.external_auth_id, userId))
        .limit(1)

      if (!user.length) {
        throw new Error("User not found in database")
      }

      const connection = await db
        .select()
        .from(mentorRelationshipsTable)
        .where(
          and(
            eq(mentorRelationshipsTable.mentor_id, mentorId),
            eq(mentorRelationshipsTable.mentee_id, user[0].unique_id)
          )
        )
        .limit(1)

      return {
        success: true,
        data: connection.length > 0 ? connection[0] : null
      }
    } catch (error) {
      console.error("Error getting connection status:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get connection status"
      }
    }
  }
)

export const CreateMentorConnectionAction = CreateServerAction(
  true, 
  async (data: ConnectionRequestData) => {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error("User not authenticated")
    }

    try {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.external_auth_id, userId))
        .limit(1)

      if (!user.length) {
        throw new Error("User not found in database. Please complete your profile setup.")
      }

      const currentUser = user[0];

      const mentor = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.unique_id, data.mentorId))
        .limit(1)

      if (!mentor.length) {
        throw new Error("Mentor not found")
      }

      const existingConnection = await db
        .select()
        .from(mentorRelationshipsTable)
        .where(
          and(
            eq(mentorRelationshipsTable.mentor_id, data.mentorId),
            eq(mentorRelationshipsTable.mentee_id, currentUser.unique_id)
          )
        )
        .limit(1)

      if (existingConnection.length > 0) {
        const status = existingConnection[0].status
        if (status === 'pending') {
          throw new Error("Connection request already sent")
        } else if (status === 'accepted') {
          throw new Error("Already connected to this mentor")
        }
      }

      const [newConnection] = await db
        .insert(mentorRelationshipsTable)
        .values({
          mentor_id: data.mentorId,
          mentee_id: currentUser.unique_id,
          status: 'pending',
          request_message: data.message || '',
        })
        .returning()

      return {
        success: true,
        data: newConnection,
        message: "Connection request sent successfully"
      }
    } catch (error) {
      console.error("Error creating mentor connection:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create connection request"
      }
    }
  }
)

export const ToggleMentorFavoriteAction = CreateServerAction(
  true, 
  async (data: FavoriteToggleData) => {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error("User not authenticated")
    }

    try {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.external_auth_id, userId))
        .limit(1)

      if (!user.length) {
        throw new Error("User not found in database")
      }
      const mentor = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.unique_id, data.mentorId))
        .limit(1)

      if (!mentor.length) {
        throw new Error("Mentor not found")
      }
      const existingFavorite = await db
        .select()
        .from(mentorFavoritesTable)
        .where(
          and(
            eq(mentorFavoritesTable.user_id, user[0].unique_id),
            eq(mentorFavoritesTable.mentor_id, data.mentorId)
          )
        )
        .limit(1)

      if (existingFavorite.length > 0) {
        await db
          .delete(mentorFavoritesTable)
          .where(eq(mentorFavoritesTable.id, existingFavorite[0].id))

        return {
          success: true,
          data: { isFavorite: false },
          message: "Removed from favorites"
        }
      } else {
        const [newFavorite] = await db
          .insert(mentorFavoritesTable)
          .values({
            user_id: user[0].unique_id,
            mentor_id: data.mentorId,
          })
          .returning()

        return {
          success: true,
          data: { isFavorite: true, favorite: newFavorite },
          message: "Added to favorites"
        }
      }
    } catch (error) {
      console.error("Error toggling mentor favorite:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to toggle favorite"
      }
    }
  }
)

export const GetUserFavoriteMentorsAction = CreateServerAction(
  true,
  async () => {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error("User not authenticated")
    }

    try {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.external_auth_id, userId))
        .limit(1)

      if (!user.length) {
        throw new Error("User not found in database")
      }

      const favorites = await db
        .select({
          mentor_id: mentorFavoritesTable.mentor_id
        })
        .from(mentorFavoritesTable)
        .where(eq(mentorFavoritesTable.user_id, user[0].unique_id))

      const favoriteIds = favorites.map(f => f.mentor_id)

      return {
        success: true,
        data: favoriteIds
      }
    } catch (error) {
      console.error("Error getting favorite mentors:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get favorite mentors"
      }
    }
  }
)

export const GetUserMentorConnectionsAction = CreateServerAction(
  true, 
  async () => {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error("User not authenticated")
    }

    try {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.external_auth_id, userId))
        .limit(1)

      if (!user.length) {
        throw new Error("User not found in database")
      }

      const connections = await db
        .select()
        .from(mentorRelationshipsTable)
        .where(eq(mentorRelationshipsTable.mentee_id, user[0].unique_id))

      return {
        success: true,
        data: connections
      }
    } catch (error) {
      console.error("Error getting mentor connections:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get mentor connections"
      }
    }
  }
)
