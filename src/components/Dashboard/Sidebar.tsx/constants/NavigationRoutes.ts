import { SiteRoutes } from "@/src/components/Dashboard/Sidebar.tsx/nav-types"

import {
  Beaker,
  Boxes,
  Calendar,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  MessageSquare,
  Network,
  Newspaper,
  SearchCheck,
  Send,
  User,
  Group
} from "lucide-react"

export const siteRoutes: SiteRoutes = {
  navMain: [
    // For future use
    // {
    //   title: "Analytics Dashboard",
    //   url: "/dashboard",
    //   icon: LayoutDashboard
    // },
    {
      title: "Profile",
      url: "/profile",
      icon: User
      // For future use
      // items: [
      //   {
      //     title: "Bio",
      //     url: "/profile/?tab=basic"
      //   },
      //   {
      //     title: "Rewards",
      //     url: "/profile/?tab=rewards"
      //   },
      //   {
      //     title: "Activity",
      //     url: "/profile/?tab=activity"
      //   },
      //   {
      //     title: "Schedule",
      //     url: "/profile/?tab=calendar"
      //   }
      // ]
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
      icon: Group
    },
    {
      title: "Find a Mentor",
      url: "/mentors",
      icon: SearchCheck
    },
    {
      title: "Advisor's Requests",
      url: "/profile/advisor-requests",
      icon: Inbox,
      permission: "advisor.view_requests"
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
  ],
  shortcuts: []
}
