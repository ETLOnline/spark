import { SiteRoutes } from "@/src/components/Dashboard/Sidebar.tsx/nav-types"

import { BarChart2, Settings2, Shield, ShieldCheck } from "lucide-react"

export const adminSiteRoutes: SiteRoutes = {
  navMain: [
    {
      title: "Analytics",
      url: "/admin/analytics/users",
      icon: BarChart2,
      extraActivePaths: ["/admin"],
      items: [
        { title: "Users", url: "/admin/analytics/users" },
        { title: "Communities", url: "/admin/analytics/communities" },
        { title: "Mentorship", url: "/admin/analytics/mentorship" },
        { title: "Leaderboards", url: "/admin/analytics/leaderboards" }
      ]
    },
    {
      title: "Roles & Permissions",
      url: "/admin/roles",
      icon: Shield
    },
    {
      title: "Site Settings",
      url: "/admin/site-settings",
      icon: Settings2,
      items: [
        {
          title: "Home Page",
          url: "/admin/site-settings/home-page"
        }
      ]
    },
    {
      title: "Community Requests",
      url: "/admin/community-requests",
      icon: ShieldCheck
    }
  ]
}
