"use client"

import { ChevronRight, Lock, Type as type, type LucideIcon } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../../ui/tooltip"
import Link from "next/link"
import { NavItem } from "./nav-types"
import { usePathname } from "next/navigation"

export default function NavMain({
  label,
  items
}: {
  label?: string
  items: NavItem[]
}) {
  const pathName = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label || ""}</SidebarGroupLabel>
      <SidebarMenu>
        {items && items.length
          ? items.map((item) => {
              const isActive = pathName.includes(item.url)

              return (
                <Collapsible
                  key={item.url + item.title}
                  asChild
                  defaultOpen={item.isActive}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className={
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                      asChild
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        {item.icon ? <item.icon /> : null}
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
                              <TooltipProvider key={subItem.title}>
                                <Tooltip delayDuration={300}>
                                  <SidebarMenuSubItem>
                                    <TooltipTrigger asChild>
                                      <SidebarMenuSubButton asChild>
                                        <Link href={subItem.url}>
                                          {subItem.icon ? (
                                            <subItem.icon />
                                          ) : null}
                                          <span className="truncate">
                                            {subItem.title}
                                          </span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </TooltipTrigger>
                                  </SidebarMenuSubItem>
                                  <TooltipContent
                                    side="right"
                                    className="bg-popover text-popover-foreground border"
                                  >
                                    {subItem.title}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              )
            })
          : null}
      </SidebarMenu>
    </SidebarGroup>
  )
}
