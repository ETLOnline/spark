export enum MilestoneStatus {
  INCOMPLETE = "incomplete",
  IN_PROGRESS = "in_progress",
  COMPLETED_PENDING_VERIFICATION = "completed_pending_verification",
  VERIFIED = "verified"
}

// Artifact entries stored as a JSON array on each milestone
export type MilestoneArtifactEntry =
  | { type: "file"; file_id: number; file_name: string; file_path: string }
  | { type: "link"; url: string }
