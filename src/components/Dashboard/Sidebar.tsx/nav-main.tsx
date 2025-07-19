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
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      {
                        item.icon ? (
                          <item.icon />                        
                        ) :null
                      }
                      <span>{item.title}</span>
                      {item?.isPrivate ? (
                        <Lock className="text-sm" height={10} />
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
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
                                <Link href={subItem.url}>
                                  {subItem.icon ? <subItem.icon /> : null}
                                  <span>{subItem.title}</span>
                                </Link>
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
