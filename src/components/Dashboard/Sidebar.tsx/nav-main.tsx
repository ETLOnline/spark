"use client"

import { ChevronRight, GanttChart, Lock, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/src/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/src/components/ui/sidebar"
import Link from "next/link"
import { NavItem } from "./nav-types"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip"
import { TooltipProvider } from "@radix-ui/react-tooltip"

export default function NavMain({
  label,
  items
}: {
  label?: string
  items: NavItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label || ""}</SidebarGroupLabel>
      <SidebarMenu>
        {items && items.length
          ? items.map((item) => (
              <Collapsible
                key={item.url + item.title}
                asChild
                defaultOpen={item.isActive}
              >
                <SidebarMenuItem>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <Link href={item.url}>
                            <item.icon />
                            <span className="truncate max-w-[200px] block">
                              {item.title}
                            </span>
                            {item?.isPrivate ? (
                              <Lock className="text-sm" height={10} />
                            ) : null}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent align="start">{item.title}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <TooltipProvider>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <Link href={subItem.url} className="flex items-center gap-x-2">
                                        {subItem.icon ? <subItem.icon /> : null}
                                        <span className="truncate max-w-[200px] block">
                                          {subItem.title}
                                        </span>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent align="start">
                                      {subItem.title}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))
          : null}
      </SidebarMenu>
    </SidebarGroup>
  )
}
