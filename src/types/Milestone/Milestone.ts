export enum MilestoneStatus {
  INCOMPLETE = "incomplete",
  IN_PROGRESS = "in_progress",
  COMPLETED_PENDING_VERIFICATION = "completed_pending_verification",
  VERIFIED = "verified"
}

// One row from `fyp_artifact_files`, joined with its `files` row when
// type is "image"/"file". `type` is decided once at insert time (from the
// uploaded file's mime type) — nothing downstream re-parses mime_type.
export type MilestoneArtifactEntry =
  | {
      id: number
      type: "image" | "file"
      file_id: number
      file_name: string
      file_path: string
    }
  | {
      id: number
      type: "link"
      url: string
    }
