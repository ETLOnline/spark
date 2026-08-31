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
  done_pending_verification: "Milestone submitted for verification.",
  completed: "Milestone marked as Completed."
}

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
