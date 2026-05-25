import { and, eq, sql } from "drizzle-orm"
import { db } from ".."
import {
  channelsTable,
  pointLedgerTable,
  projectTable,
  taskTable
} from "../schema"

const PROJECT_ID_FROM_URL = /\/project\/([a-f0-9-]{36})/i

async function resolveCommunityId(
  tx: any,
  projectId: string
): Promise<string | null> {
  const result = await tx
    .select({ community_id: channelsTable.community_id })
    .from(projectTable)
    .innerJoin(channelsTable, eq(projectTable.channel_id, channelsTable.id))
    .where(eq(projectTable.id, projectId))
    .limit(1)

  return result[0]?.community_id ?? null
}

async function resolveProjectId(
  tx: any,
  metadata: Record<string, any>
): Promise<string | undefined> {
  // 1. Direct project_id in metadata
  if (metadata.project_id) return metadata.project_id

  // 2. task_id → task.project_id
  if (metadata.task_id) {
    const task = await tx
      .select({ project_id: taskTable.project_id })
      .from(taskTable)
      .where(eq(taskTable.id, metadata.task_id))
      .limit(1)

    if (task[0]?.project_id) return task[0].project_id
  }

  // 3. proof_url → extract project id from /project/{uuid}/
  if (metadata.proof_url) {
    const match = PROJECT_ID_FROM_URL.exec(metadata.proof_url)
    if (match?.[1]) return match[1]
  }

  return undefined
}

export const BackfillLedgerCommunityIdSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      const entries = await tx
        .select()
        .from(pointLedgerTable)
        .where(
          and(
            eq(pointLedgerTable.reward_id, 1),
            sql`(${pointLedgerTable.metadata}->>'community_id') IS NULL`
          )
        )

      console.log(
        `📊 Found ${entries.length} ledger entries missing community_id`
      )

      let patched = 0
      let skipped = 0

      for (const entry of entries) {
        const metadata = entry.metadata as Record<string, any>

        const projectId = await resolveProjectId(tx, metadata)

        if (!projectId) {
          console.warn(
            `⚠️  Skipping transection_id=${entry.transection_id} — cannot resolve project_id (metadata: ${JSON.stringify(metadata)})`
          )
          skipped++
          continue
        }

        const communityId = await resolveCommunityId(tx, projectId)

        if (!communityId) {
          console.warn(
            `⚠️  Skipping transection_id=${entry.transection_id} — project ${projectId} has no channel/community`
          )
          skipped++
          continue
        }

        await tx
          .update(pointLedgerTable)
          .set({
            metadata: sql`${pointLedgerTable.metadata} || ${JSON.stringify({ community_id: communityId })}::jsonb`
          })
          .where(eq(pointLedgerTable.transection_id, entry.transection_id))

        patched++
      }

      console.log(
        `✅ Backfill complete — patched: ${patched}, skipped: ${skipped}`
      )
    } catch (e) {
      console.error("❌ BackfillLedgerCommunityIdSeed failed:", e)
      tx.rollback()
      process.exit(1)
    }
  })
}
