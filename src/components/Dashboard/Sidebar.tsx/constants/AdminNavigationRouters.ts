import { SiteRoutes } from "@/src/components/Dashboard/Sidebar.tsx/nav-types"

import { Shield } from "lucide-react"

export const adminSiteRoutes: SiteRoutes = {
  navMain: [
    {
      title: "Roles & Permissions",
      url: "/admin/roles",
      icon: Shield
    }
  ]
}
