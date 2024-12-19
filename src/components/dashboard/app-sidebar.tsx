"use client"

import * as React from "react"
import {
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  Newspaper,
  User,
  MessageSquare,
  Calendar,
  BetweenHorizontalStart,
  Lightbulb,
  Beaker,
  LayoutDashboard,
} from "lucide-react"

import NavMain from "@/src/components/dashboard/nav-main"
import NavSecondary from "@/src/components/dashboard/nav-secondary"
import NavUser from "@/src/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar"
import { SignedIn } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Analytics Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
      items: [
        {
          title: "Bio",
          url: "/profile/?tab=basic",
        },
        {
          title: "Rewards",
          url: "/profile/?tab=rewards",
        },
        {
          title: "Activity",
          url: "/profile/?tab=activity",
        },
        {
          title: "Schedule",
          url: "/profile/?tab=calendar",
        },
      ],
    },
    {
      title: "Posts",
      url: "/posts",
      icon: Newspaper,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
    },
    {
      title: "Events",
      url: "/events",
      icon: Calendar,
    },
    {
      title: "Spaces",
      url: "/spaces",
      icon: BetweenHorizontalStart,
    },
    {
      title: "Project Incubator",
      url: "/project-incubator",
      icon: Lightbulb,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  testNav:[
    {
      title: "Test",
      url: "#",
      icon: Beaker,
      items: [
        {
          title: "Team Collaboration",
          url: "/test/team-collaboration",
        },
        {
          title: "Learning Hub",
          url: "/test/learning-hub",
        },
        {
          title: "Marketplace",
          url: "/test/marketplace",
        }
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square   items-center justify-center rounded-lg border  text-sidebar-primary-foreground">
                  <Image sizes="8" src="/logo/spark-logo-no-bg.png" alt="spark-logo" width={40} height={40} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Spark</span>
                  <span className="truncate text-xs">ETLOnline</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Platform" />
        <NavMain items={data.testNav} label="Test" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SignedIn>
          <NavUser />
        </SignedIn>
      </SidebarFooter>
    </Sidebar>
  )
}
