import { eq } from "drizzle-orm"
import { db } from "../.."
import { mentorAvailabilityTable } from "../../schema"

export interface MentorAvailabilitySlotInput {
  date: string
  start_time: string
  end_time: string
  session_type: string
  repeat_type: string
  repeat_end_date?: string | null
}

export async function GetMentorAvailability(mentorId: string) {
  return await db
    .select()
    .from(mentorAvailabilityTable)
    .where(eq(mentorAvailabilityTable.mentor_id, mentorId))
}

/** Replace all slots for a mentor atomically (delete + reinsert in one transaction). */
export async function ReplaceMentorAvailability(
  mentorId: string,
  slots: MentorAvailabilitySlotInput[]
) {
  await db.transaction(async (tx) => {
    await tx
      .delete(mentorAvailabilityTable)
      .where(eq(mentorAvailabilityTable.mentor_id, mentorId))

    if (slots.length > 0) {
      await tx.insert(mentorAvailabilityTable).values(
        slots.map((slot) => ({
          mentor_id: mentorId,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          session_type: slot.session_type,
          repeat_type: slot.repeat_type,
          repeat_end_date: slot.repeat_end_date ?? null,
          is_active: true
        }))
      )
    }
  })
}
