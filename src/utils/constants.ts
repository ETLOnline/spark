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
    id: "projects",
    url: "/projects",
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

export type PageMeta = (typeof pageMeta)[0]
