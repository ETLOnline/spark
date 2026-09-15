import { MilestoneStatus } from "@/src/types/Milestone/Milestone"

// ─── Milestone Status Flow ────────────────────────────────────────────────────
// Strict forward order used to validate status transitions.

export const MILESTONE_STATUS_FLOW: MilestoneStatus[] = [
  MilestoneStatus.INCOMPLETE,
  MilestoneStatus.IN_PROGRESS,
  MilestoneStatus.COMPLETED_PENDING_VERIFICATION,
  MilestoneStatus.VERIFIED
]

// ─── Milestone Allowed Reversions ─────────────────────────────────────────────
// Maps each status to the one it can be reverted to by an Advisor / Admin.

export const MILESTONE_ALLOWED_REVERSIONS: Partial<
  Record<MilestoneStatus, MilestoneStatus>
> = {
  [MilestoneStatus.VERIFIED]: MilestoneStatus.COMPLETED_PENDING_VERIFICATION,
  [MilestoneStatus.COMPLETED_PENDING_VERIFICATION]: MilestoneStatus.IN_PROGRESS,
  [MilestoneStatus.IN_PROGRESS]: MilestoneStatus.INCOMPLETE
}

export const spaceStaticFeatures = [
  {
    name: "Settings",
    icon: "settings",
    slug: "settings"
  },
  {
    name: "Users",
    icon: "users",
    slug: "users"
  }
]

export const defaultSpaceOverviewTemplate = (spaceName: string) =>
  `
  <h2>Welcome to ${spaceName}</h2>
  <h3>About This Space</h3>
  <p>Collaborate on marketing campaigns, content creation, and brand strategy</p>
  
  <h3>Getting Started</h3>
  <p>Welcome to our collaborative workspace! Here's how to make the most of this space:</p>
  
  <ul>
    <li>
      <strong>Explore Features</strong>: Use the sidebar to navigate between different tools
    </li>
    <li>
      <strong>Join Conversations</strong>: Check out the Team Chat for ongoing discussions
    </li>
  </ul>
`
export const TEMPLATE_MILESTONES = [
  "Proposal Approval",
  "SRS",
  "SDD",
  "Implementation",
  "Testing & Validation",
  "Deployment & Documentation"
]

export const CUSTOM_MILESTONE_FEATURES = [
  "Add milestones",
  "Set start and end dates",
  "Reorder milestones",
  "Edit or remove milestones"
]

export const MILESTONE_STATUS_TOAST: Record<string, string> = {
  in_progress: "Milestone marked as In Progress.",
  completed_pending_verification:
    "Milestone marked as Completed (Pending Verification).",
  verified: "Milestone verified successfully."
}

// ─── Milestone Artifact Image Extensions ─────────────────────────────────────

export const MILESTONE_IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "jfif",
  "jpe",
  "gif",
  "webp",
  "bmp",
  "svg",
  "avif"
])

// ─── Milestone Date Format ────────────────────────────────────────────────────

export const MILESTONE_DATE_FORMAT = "DD MMM YYYY"

// ─── Milestone Artifact Upload Constraints ────────────────────────────────────
// Single source of truth used by both the server action and the upload dialog.

export const MILESTONE_ARTIFACT_MAX_SIZE = 200 * 1024 * 1024 // 200 MB

export const MILESTONE_ARTIFACT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp"
]

// Accept string for <FileUpload accept="..."> — must include "image/*" so the
// component's acceptIncludesImage check passes and allows PNG/JPG/GIF/WebP.
export const MILESTONE_ARTIFACT_ACCEPT =
  ".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
