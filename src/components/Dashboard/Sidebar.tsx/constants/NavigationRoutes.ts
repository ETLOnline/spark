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
  User,
  Group
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
      icon: Newspaper,
      permission: "posting.view"
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
      permission: "chat.view"
    },
    {
      title: "Events",
      url: "/events",
      icon: Calendar,
      permission: "events.view"
    },
    {
      title: "Communities",
      url: "/communities",
      icon: Group,
      permission: "communities.view"
    }
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
      url: "/support",
      icon: LifeBuoy
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send
    }
  ]
}
