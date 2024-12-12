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
    description: "user profiule containing bio, rewards, activity and schedule"
  },
  {
    id: "posts",
    url: "/posts",
    title: "Posts",
    description: "post feed"
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
  }
]

export type PageMeta = typeof pageMeta[0]
