import { db } from "../.."
import { mentorRatingsTable, mentorRelationshipsTable, SelectMentorRating, SelectMentorRelationship } from "../../schema"
import { eq } from "drizzle-orm"

// Fetch all ratings for a given mentor
export async function GetMentorRatings(mentorId: string): Promise<SelectMentorRating[]> {
  return db.query.mentorRatingsTable.findMany({
    where: eq(mentorRatingsTable.mentor_id, mentorId)
  })
}

// Fetch all relationships for a given mentor
export async function GetMentorRelationships(mentorId: string): Promise<SelectMentorRelationship[]> {
  return db.query.mentorRelationshipsTable.findMany({
    where: eq(mentorRelationshipsTable.mentor_id, mentorId)
  })
}
