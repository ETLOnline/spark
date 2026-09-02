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
