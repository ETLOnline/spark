export enum MilestoneStatus {
  INCOMPLETE = "incomplete",
  IN_PROGRESS = "in_progress",
  COMPLETED_PENDING_VERIFICATION = "completed_pending_verification",
  VERIFIED = "verified"
}


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
