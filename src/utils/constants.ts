export const pageMeta = [
  {
    id: "home",
    url: "/",
    title: "Home",
    description: "home/landing page"
  },
  {
    id: "profile",
    url: "/profile",
    title: "Profile",
    description: "user profile containing bio, rewards, activity and schedule"
  },
  {
    id: "events",
    url: "/events",
    title: "Events",
    description: "events"
  },
  {
    id: "chat",
    url: "/chat",
    title: "Chat",
    description: "chat feed"
  },
  {
    id: "posts",
    url: "/posts",
    title: "Posts",
    description: "post feed"
  },
  {
    id: "project-incubator",
    url: "/project-incubator",
    title: "Project Incubator",
    description: "project incubator"
  },
  {
    id: "spaces",
    url: "/spaces",
    title: "Spaces",
    description: "spaces"
  },
  {
    id: "settings",
    url: "/settings",
    title: "Settings",
    description: "user settings"
  },
  {
    id: "general settings",
    url: "/settings/general",
    title: "General",
    description: "general settings"
  },
  {
    id: "team settings",
    url: "/settings/team",
    title: "Team",
    description: "team settings"
  },
  {
    id: "billing settings",
    url: "/settings/billing",
    title: "Billing",
    description: "billing settings"
  },
  {
    id: "limit settings",
    url: "/settings/limit",
    title: "Limit",
    description: "limit settings"
  },
  {
    id: "project",
    url: (channel_slug: string, spaceSlug: string) =>
      `/channels/${channel_slug}/spaces/${spaceSlug}?page-type=project-management`,
    title: "Projects",
    description: "projects"
  },
  {
    id: "channels",
    url: "/channels",
    title: "Channels",
    description: "channels"
  },
  {
    id: "connections",
    url: "/connections",
    title: "Connections",
    description: "connections"
  },
  {
    id: "feedback",
    url: "/feedback",
    title: "Feedback",
    description: "feedback"
  },
  {
    id: "support",
    url: "/support",
    title: "Support",
    description: "support"
  }
]

export const categories = [
  "All",
  "Programming",
  "AI & Machine Learning",
  "Open Source",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "IoT"
]

export const permissions = {
  posting: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete"
  },

  chat: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete"
  },

  events: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete"
  },

  community: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete",
    allowAction: "allow.action",
    userInvite: "user.invite",
    userEmailInvite: "user.email.invite",
    userUpdate: "user.update",
    userRemove: "user.remove",
    userView: "user.view",
    channelCreate: "channel.create"
  },

  channel: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete",
    allowAction: "allow.action",
    spaceCreate: "space.create",
    userView: "user.view",
    userInvite: "user.invite",
    userRemove: "user.remove",
    userUpdate: "user.update"
  },

  space: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete",
    allowAction: "allow.action",
    projectCreate: "project.create",
    settingUpdate: "setting.update",
    userInvite: "user.invite",
    userView: "user.view",
    userUpdate: "user.update",
    userRemove: "user.remove",
    fileCreate: "file_sharing.create",
    fileView: "file_sharing.view",
    fileUpdate: "file_sharing.update",
    fileDelete: "file_sharing.delete",
    fileAllow: "file_sharing.allow.action",
    postingCreate: "posting.create",
    postingView: "posting.view",
    postingUpdate: "posting.update",
    postingDelete: "posting.delete",
    chatCreate: "chat.create",
    chatView: "chat.view",
    chatUpdate: "chat.update",
    chatDelete: "chat.delete",
    projectView: "project.view"
  },

  project: {
    create: "create",
    view: "view",
    update: "update",
    detail: "detail",
    launchBoard: "launch.board",
    overviewView: "overview.view",
    sprintCreate: "sprint.create",
    sprintUpdate: "sprint.update",
    sprintView: "sprint.view",
    taskCreate: "task.create",
    taskView: "task.view",
    taskUpdate: "task.update",
    taskDelete: "task.delete",
    boardView: "board.view",
    backlogView: "backlog.view",
    backlogTaskView: "backlog.task.view",
    backlogTaskCreate: "backlog.task.create",
    backlogTaskUpdate: "backlog.task.update",
    backlogTaskDelete: "backlog.task.delete",
    filesView: "files.view",
    teamsView: "teams.view",
    teamsAdd: "teams.add",
    teamsUpdate: "teams.update",
    teamsDelete: "teams.delete",
    settingsView: "settings.view",
    DetailView: "details.view",
    ChatView: "chat.view"
  },

  mentorship: {
    sessionRequest: "session.request",
    addAvailability: "add_availibility"
  },

  fyp: {
    canRequestAdvisor: "can_request_advisor",
    canReceiveAdvisorRequest: "can_receive_advisor_request",
    viewAdvisorRequests: "view_advisor_requests"
  }
}

export type PageMeta = (typeof pageMeta)[0]

export enum Sendgrid {
  SENDGRID_TASK_UPDATE_TEMPLATE_ID = "d-d2538f8fe746453c9b264174ed580961"
}

export const onboardingRewardData = [
  {
    action: "Complete Your Profile",
    reward: "+50 RP",
    color: "bg-blue-50"
  },
  {
    action: "Share Your First Post",
    reward: "+30 RP",
    color: "bg-green-50"
  },
  {
    action: "Help Another Member",
    reward: "+20 RP",
    color: "bg-purple-50"
  },
  {
    action: "Complete a Milestone",
    reward: "+150 RP + 50 SC",
    color: "bg-yellow-50"
  },
  {
    action: "Get Skill Verified",
    reward: "+75 RP",
    color: "bg-pink-50"
  }
]

export const onboardingLevelData = [
  {
    level: "Spark Starter",
    rp: "0 - 500",
    features: "Basic access, join communities"
  },
  {
    level: "Spark Contributor",
    rp: "500 - 1500",
    features: "Post & comment, find mentors"
  },
  {
    level: "Spark Collaborator",
    rp: "1500 - 3000",
    features: "Lead discussions, advanced projects"
  },
  {
    level: "Spark Leader",
    rp: "3000 - 5000",
    features: "Mentor others, host workshops"
  },
  {
    level: "Spark Champion",
    rp: "5000+",
    features: "Platform leadership, exclusive perks"
  }
]

export const trustEngineFeatures = [
  {
    icon: "Zap",
    title: "Dual-Currency System",
    description:
      "Earn Reputation Points for learning and Spark Credits for achievements",
    href: "/spark/onboarding"
  },
  {
    icon: "Award",
    title: "Level Progression",
    description:
      "Unlock opportunities as you advance through 5 distinct trust levels",
    href: "/spark/dashboard"
  },
  {
    icon: "Users",
    title: "Community Ranking",
    description:
      "Compete fairly on community leaderboards and track your growth",
    href: "/spark/dashboard?tab=ranking"
  },
  {
    icon: "BarChart3",
    title: "Transaction Ledger",
    description:
      "See exactly how you earned or spent your reputation and credits",
    href: "/spark/dashboard?tab=transactions"
  },
  {
    icon: "Target",
    title: "Opportunity Gating",
    description: "Discover what new opportunities unlock at each level",
    href: "/spark/dashboard?tab=opportunities"
  },
  {
    icon: "TrendingUp",
    title: "Advisor Tools",
    description:
      "Mentors can track student progress and award meaningful achievements",
    href: "/spark/advisor"
  }
]

export const EntityUpdateBroadCast = "broadcast-entity-update"

/** Reputation Points reward_id in the rewards/reward-balance tables (see RewardsSeed.ts). */
export const REPUTATION_POINTS_REWARD_ID = 1

/** Minimum RP a mentee needs to view a mentor's availability or request a session. */
export const RP_THRESHOLD = 500

/** Max length for a session request's Topic field. */
export const SESSION_REQUEST_TOPIC_MAX_LENGTH = 100

/** Max length for a session request's Description field. */
export const SESSION_REQUEST_DESCRIPTION_MAX_LENGTH = 500

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]

export const DAY_HEADERS = DAYS.map((d) => d.slice(0, 3))

/** Max size (in bytes) for an advisor request's proposal file. */
export const ADVISOR_REQUEST_PROPOSAL_MAX_FILE_SIZE = 50 * 1024 * 1024

/** Mime types accepted for an advisor request's proposal file. */
export const ADVISOR_REQUEST_PROPOSAL_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

/** `accept` attribute value for the proposal file upload input. */
export const ADVISOR_REQUEST_PROPOSAL_ACCEPT = [
  ".pdf",
  ".doc",
  ".docx",
  ...ADVISOR_REQUEST_PROPOSAL_ALLOWED_MIME_TYPES
].join(",")
