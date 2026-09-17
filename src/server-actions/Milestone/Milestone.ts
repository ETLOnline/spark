"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  AddMilestoneArtifact,
  ApplyMilestoneDiff,
  BulkCreateMilestones,
  CountMilestoneArtifacts,
  DeleteMilestone,
  DeleteMilestoneArtifact,
  GetMilestoneById,
  GetMilestoneWithSpace,
  GetMilestonesForSpace,
  RawMilestoneArtifact,
  RawMilestoneWithArtifacts,
  UpdateMilestone
} from "@/src/db/data-access/milestones/query"
import { getSpaceUsers } from "@/src/db/data-access/spaces/query"
import { InsertFypMilestone } from "@/src/db/schema"
import {
  MilestoneArtifactEntry,
  MilestoneStatus
} from "@/src/types/Milestone/Milestone"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { notifyManagersMilestoneDone } from "@/src/services/notify/milestone/milestone"
import {
  MILESTONE_ARTIFACT_MAX_SIZE,
  MILESTONE_ARTIFACT_MIME_TYPES,
  MILESTONE_STATUS_FLOW,
  MILESTONE_ALLOWED_REVERSIONS
} from "@/src/app/(dashboard)/channels/[channel_slug]/spaces/[space_slug]/(space-layout)/components/constants"

// ─── Response shaping ─────────────────────────────────────────────────────────
// Turns a raw fyp_artifact_files row (joined with its file, if any) into the
// flat shape the client consumes. Lives here rather than in the data-access
// layer — same reasoning as getAdvisorViewerStatus living in
// AdvisorRequest.ts instead of advisor-requests/query.ts: deciding what the
// response looks like is a server-action concern, not a query concern.
// A dangling file_id (file row missing) is dropped rather than surfaced as a
// broken entry.

export type MilestoneWithArtifacts = Omit<
  RawMilestoneWithArtifacts,
  "artifacts"
> & { artifacts: MilestoneArtifactEntry[] }

function toArtifactEntry(row: RawMilestoneArtifact): MilestoneArtifactEntry | null {
  if (row.type === "link") {
    return row.url ? { id: row.id, type: "link", url: row.url } : null
  }
  if (!row.file) return null
  return {
    id: row.id,
    type: row.type as "image" | "file",
    file_id: row.file.id,
    file_name: row.file.file_name,
    file_path: row.file.file_path
  }
}

function withMappedArtifacts<T extends RawMilestoneWithArtifacts>(
  milestone: T
): Omit<T, "artifacts"> & { artifacts: MilestoneArtifactEntry[] } {
  return {
    ...milestone,
    artifacts: milestone.artifacts
      .map(toArtifactEntry)
      .filter((a): a is MilestoneArtifactEntry => a !== null)
  }
}

// ─── Get single milestone ─────────────────────────────────────────────────────

export const GetMilestoneByIdAction = CreateServerAction(
  true,
  async (milestoneId: string) => {
    try {
      const milestone = await GetMilestoneById(milestoneId)
      if (!milestone) return { success: false, message: "Milestone not found" }
      return { success: true, data: withMappedArtifacts(milestone) }
    } catch (error) {
      return { error }
    }
  }
)

// ─── Get milestones ───────────────────────────────────────────────────────────

export const GetMilestonesForSpaceAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const milestones = await GetMilestonesForSpace(spaceId)
      return { success: true, data: milestones.map(withMappedArtifacts) }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── First-time setup ─────────────────────────────────────────────────────────
// Only called when there are no milestones yet. Bulk inserts all as INCOMPLETE.

export const SetupMilestonesAction = CreateServerAction(
  true,
  async (
    spaceId: string,
    inputs: Pick<
      InsertFypMilestone,
      "name" | "start_date" | "end_date" | "order_index"
    >[]
  ) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      const rows: InsertFypMilestone[] = inputs.map((m) => ({
        space_id: spaceId,
        name: m.name,
        status: MilestoneStatus.INCOMPLETE,
        start_date: m.start_date ?? null,
        end_date: m.end_date ?? null,
        order_index: m.order_index,
        created_by: user.unique_id
      }))

      const created = await BulkCreateMilestones(rows)
      const withArtifacts: MilestoneWithArtifacts[] = created.map((m) => ({
        ...m,
        artifacts: []
      }))
      return { success: true, data: withArtifacts }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Reconfigure ──────────────────────────────────────────────────────────────
// Diffs the new configuration against current DB state and applies only the
// necessary creates / updates / deletes in a single transaction.
// Existing milestone statuses and student progress are preserved.

export const ReconfigureMilestonesAction = CreateServerAction(
  true,
  async (
    spaceId: string,
    inputs: Pick<
      InsertFypMilestone,
      "id" | "name" | "start_date" | "end_date" | "order_index"
    >[]
  ) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      const current = await GetMilestonesForSpace(spaceId)
      const currentIds = new Set(current.map((m) => m.id))
      const keptIds = new Set(inputs.filter((i) => i.id).map((i) => i.id!))

      const toDelete = current
        .filter((m) => !keptIds.has(m.id))
        .map((m) => m.id)

      const toUpdate = inputs
        .filter((i) => i.id && currentIds.has(i.id))
        .map((i) => ({
          id: i.id!,
          data: {
            name: i.name,
            start_date: i.start_date ?? null,
            end_date: i.end_date ?? null,
            order_index: i.order_index
          }
        }))

      const toCreate: InsertFypMilestone[] = inputs
        .filter((i) => !i.id)
        .map((m) => ({
          space_id: spaceId,
          name: m.name,
          status: MilestoneStatus.INCOMPLETE,
          start_date: m.start_date ?? null,
          end_date: m.end_date ?? null,
          order_index: m.order_index,
          created_by: user.unique_id
        }))

      const milestones = await ApplyMilestoneDiff({
        spaceId,
        toCreate,
        toUpdate,
        toDelete
      })

      return { success: true, data: milestones.map(withMappedArtifacts) }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Update a milestone ────────────────────────────────────────────────────────

export const UpdateMilestoneAction = CreateServerAction(
  true,
  async (
    id: string,
    data: {
      name?: string
      status?: string
      start_date?: string
      end_date?: string
      order_index?: number
    }
  ) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      if (data.status) {
        const ctx = await GetMilestoneWithSpace(id)
        if (!ctx) return { success: false, message: "Milestone not found" }

        const currentStatus = ctx.milestone.status as MilestoneStatus
        const newStatus = data.status as MilestoneStatus

        // Enforce strict forward order:
        // incomplete → in_progress → completed_pending_verification → verified
        const currentIdx = MILESTONE_STATUS_FLOW.indexOf(currentStatus)
        const newIdx = MILESTONE_STATUS_FLOW.indexOf(newStatus)
        if (newIdx !== currentIdx + 1) {
          return { success: false, message: "Invalid status transition." }
        }

        // Require ≥1 artifact before Completed (Pending Verification) or Verified
        if (
          newStatus === MilestoneStatus.COMPLETED_PENDING_VERIFICATION ||
          newStatus === MilestoneStatus.VERIFIED
        ) {
          if (ctx.milestone.artifacts.length === 0) {
            return {
              success: false,
              message:
                newStatus === MilestoneStatus.VERIFIED
                  ? "At least one artifact is required before verifying this milestone."
                  : "Please add at least one artifact before marking as Completed."
            }
          }
        }

        const updated = await UpdateMilestone(id, data)

        // Notify advisors/admins when student submits for verification
        if (newStatus === MilestoneStatus.COMPLETED_PENDING_VERIFICATION) {
          ;(async () => {
            try {
              const deepLink =
                ctx.channelSlug && ctx.spaceSlug
                  ? `/channels/${ctx.channelSlug}/spaces/${ctx.spaceSlug}?page-type=fyp&fyp-tab=milestones`
                  : "/"

              const spaceUsers = await getSpaceUsers(ctx.milestone.space_id)
              const usersToNotify = spaceUsers
                .map((su) => su.user)
                .filter(
                  (u): u is NonNullable<typeof u> =>
                    !!u &&
                    !!u.unique_id &&
                    !!u.email &&
                    u.unique_id !== user.unique_id
                )

              await notifyManagersMilestoneDone(
                usersToNotify.map((m) => ({
                  unique_id: m.unique_id,
                  email: m.email
                })),
                {
                  milestoneName: ctx.milestone.name,
                  studentId: user.unique_id,
                  studentName:
                    `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
                  spaceName: ctx.spaceName,
                  deepLink
                }
              )
            } catch {
              // notifications are non-critical
            }
          })()
        }

        return { success: true, data: updated ? withMappedArtifacts(updated) : null }
      }

      // Metadata-only update (name, dates, order)
      const updated = await UpdateMilestone(id, data)
      return { success: true, data: updated ? withMappedArtifacts(updated) : null }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Submit artifact ──────────────────────────────────────────────────────────
// Student adds one row to fyp_artifact_files for this milestone.
// Multiple artifacts are allowed; at least one is required to mark as Done.

export const SubmitMilestoneArtifactAction = CreateServerAction(
  true,
  async (
    milestoneId: string,
    artifact: {
      file?: {
        name: string
        sizeBytes: number
        base64: string
        mimeType: string
      }
      link?: string
    }
  ) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      if (!artifact.file && !artifact.link) {
        return { success: false, message: "Please provide a file or a link." }
      }

      const milestone = await GetMilestoneById(milestoneId)
      if (!milestone) return { success: false, message: "Milestone not found" }

      // Block artifact submission once milestone is verified
      if ((milestone.status as MilestoneStatus) === MilestoneStatus.VERIFIED) {
        return {
          success: false,
          message:
            "Artifacts cannot be added to a verified milestone. Contact your Advisor or University Admin."
        }
      }

      if (artifact.file) {
        if (!MILESTONE_ARTIFACT_MIME_TYPES.includes(artifact.file.mimeType)) {
          return {
            success: false,
            message:
              "File type not supported. Use PDF, DOC, DOCX, or image (PNG, JPG, GIF, WebP)."
          }
        }
        if (artifact.file.sizeBytes > MILESTONE_ARTIFACT_MAX_SIZE) {
          return { success: false, message: "File must be 200 MB or smaller." }
        }

        const buffer = base64ToBuffer(artifact.file.base64)
        const { fileRecord } = await uploadFileAndSaveMetadata(
          buffer,
          artifact.file.name,
          artifact.file.mimeType,
          "milestone-artifacts"
        )
        await AddMilestoneArtifact({
          milestone_id: milestoneId,
          type: artifact.file.mimeType.startsWith("image/") ? "image" : "file",
          file_id: fileRecord.id
        })
      } else {
        await AddMilestoneArtifact({
          milestone_id: milestoneId,
          type: "link",
          url: artifact.link!.trim()
        })
      }

      const updated = await GetMilestoneById(milestoneId)
      return { success: true, data: updated ? withMappedArtifacts(updated) : null }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Delete artifact ──────────────────────────────────────────────────────────
// Removes one artifact row by its id.
// Nobody can delete artifacts once the milestone is Verified.

export const DeleteMilestoneArtifactAction = CreateServerAction(
  true,
  async (milestoneId: string, artifactId: number) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      const milestone = await GetMilestoneById(milestoneId)
      if (!milestone) return { success: false, message: "Milestone not found" }

      const status = milestone.status as MilestoneStatus

      // Block deletions on verified milestones
      if (status === MilestoneStatus.VERIFIED) {
        return {
          success: false,
          message: "Artifacts cannot be removed from a verified milestone."
        }
      }

      await DeleteMilestoneArtifact(artifactId)
      const remaining = await CountMilestoneArtifacts(milestoneId)

      // If the student removed the last artifact while pending verification,
      // revert the milestone back to IN_PROGRESS so Advisors don't see an
      // empty evidence state awaiting review.
      const shouldRevert =
        remaining === 0 &&
        status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION

      const updated = shouldRevert
        ? await UpdateMilestone(milestoneId, {
            status: MilestoneStatus.IN_PROGRESS
          })
        : await GetMilestoneById(milestoneId)

      return { success: true, data: updated ? withMappedArtifacts(updated) : null }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Revert milestone status ───────────────────────────────────────────────────
// Advisor / Admin only. Moves status back and notifies the student.
// Allowed reversions:
//   completed_pending_verification → in_progress
//   verified                       → completed_pending_verification

export const RevertMilestoneAction = CreateServerAction(
  true,
  async (milestoneId: string) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      const ctx = await GetMilestoneWithSpace(milestoneId)
      if (!ctx) return { success: false, message: "Milestone not found" }

      const currentStatus = ctx.milestone.status as MilestoneStatus
      const targetStatus = MILESTONE_ALLOWED_REVERSIONS[currentStatus]
      if (!targetStatus) {
        return {
          success: false,
          message: "This milestone cannot be reverted from its current status."
        }
      }

      const updated = await UpdateMilestone(milestoneId, {
        status: targetStatus
      })

      return { success: true, data: updated ? withMappedArtifacts(updated) : null }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Delete a milestone ────────────────────────────────────────────────────────

export const DeleteMilestoneAction = CreateServerAction(
  true,
  async (id: string) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }
      await DeleteMilestone(id)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)
