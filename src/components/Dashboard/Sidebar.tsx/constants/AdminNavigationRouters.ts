import { SiteRoutes } from "@/src/components/Dashboard/Sidebar.tsx/nav-types"

import { Settings2, Shield } from "lucide-react"

export const adminSiteRoutes: SiteRoutes = {
  navMain: [
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
    }
  ]
}
