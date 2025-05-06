import { SiteRoutes } from "@/src/components/Dashboard/Sidebar.tsx/nav-types"

import {
  Beaker,
  Boxes,
  Calendar,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  MessageSquare,
  Network,
  Newspaper,
  Send,
  Settings2,
  User
} from "lucide-react"

export const siteRoutes: SiteRoutes = {
  navMain: [
    {
      title: "Analytics Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
      items: [
        {
          title: "Bio",
          url: "/profile/?tab=basic"
        },
        {
          title: "Rewards",
          url: "/profile/?tab=rewards"
        },
        {
          title: "Activity",
          url: "/profile/?tab=activity"
        },
        {
          title: "Schedule",
          url: "/profile/?tab=calendar"
        }
      ]
    },
    {
      title: "Connections",
      url: "/connections",
      icon: Network
    },
    {
      title: "Posts",
      url: "/posts",
      icon: Newspaper
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare
    },
    {
      title: "Events",
      url: "/events",
      icon: Calendar
    },
    {
      title: "Channels",
      url: "/channels",
      icon: Boxes
    },
    // {
    //   title: "Project Incubator",
    //   url: "/project-incubator",
    //   icon: Lightbulb
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#"
    //     },
    //     {
    //       title: "Team",
    //       url: "#"
    //     },
    //     {
    //       title: "Billing",
    //       url: "#"
    //     },
    //     {
    //       title: "Limits",
    //       url: "#"
    //     }
    //   ]
    // }
  ],
  testNav: [
    {
      title: "Test",
      url: "#",
      icon: Beaker,
      items: [
        {
          title: "Team Collaboration",
          url: "/test/team-collaboration"
        },
        {
          title: "Learning Hub",
          url: "/test/learning-hub"
        },
        {
          title: "Marketplace",
          url: "/test/marketplace"
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send
    }
  ]
}
