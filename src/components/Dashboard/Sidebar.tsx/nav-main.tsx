"use client"

import { ChevronRight, Lock } from "lucide-react"
import { useEffect, useState } from "react"
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
import { useSidebar } from "@/src/components/ui/sidebar"
import { Button } from "@/src/components/ui/button"

export default function NavMain({
  label,
  items
}: {
  label?: string
  items: NavItem[]
}) {
  const pathName = usePathname()
  const sidebar = useSidebar()
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  // Close all dropdowns when sidebar is collapsed
  useEffect(() => {
    if (sidebar?.state === "collapsed") {
      setOpenItems(new Set())
    }
  }, [sidebar?.state])
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label || ""}</SidebarGroupLabel>
      <SidebarMenu>
        {items && items.length
          ? items.map((item) => {
              const isActive =
                item.url === "#"
                  ? false
                  : item.url === "/"
                    ? pathName === "/"
                    : pathName === item.url ||
                      pathName.startsWith(item.url + "/") ||
                      pathName.startsWith(item.url + "?")
              const itemKey = item.url + item.title
              const isOpen = openItems.has(itemKey)

              return (
                <Collapsible
                  key={itemKey}
                  asChild
                  open={isOpen}
                  onOpenChange={(open) => {
                    const newOpenItems = new Set(openItems)
                    if (open) {
                      newOpenItems.add(itemKey)
                    } else {
                      newOpenItems.delete(itemKey)
                    }
                    setOpenItems(newOpenItems)
                  }}
                >
                  <SidebarMenuItem>
                    {item.items && item.items.length ? (
                      // If item has children, make the whole button a collapsible trigger
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : ""
                          }
                          asChild
                          tooltip={item.title}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              // Expand app sidebar first if collapsed, then let CollapsibleTrigger toggle
                              if (sidebar?.state === "collapsed")
                                sidebar.toggleSidebar()
                            }}
                          >
                            {item.icon ? <item.icon /> : null}
                            <span>{item.title}</span>
                            {item?.isPrivate ? (
                              <Lock className="text-sm" height={10} />
                            ) : null}
                          </Button>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    ) : (
                      <SidebarMenuButton
                        className={
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : ""
                        }
                        asChild
                        tooltip={item.title}
                      >
                        <Link
                          href={item.url}
                          onClick={() => {
                            if (sidebar?.state === "collapsed")
                              sidebar.toggleSidebar()
                          }}
                        >
                          {item.icon ? <item.icon /> : null}
                          <span>{item.title}</span>
                          {item?.isPrivate ? (
                            <Lock className="text-sm" height={10} />
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    )}
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
                            {item.items.map((subItem) => (
                              <TooltipProvider
                                key={subItem.url + subItem.title}
                              >
                                <Tooltip delayDuration={300}>
                                  <SidebarMenuSubItem>
                                    <TooltipTrigger asChild>
                                      <SidebarMenuSubButton asChild>
                                        <Link
                                          href={subItem.url}
                                          onClick={() => {
                                            if (sidebar?.state === "collapsed")
                                              sidebar.toggleSidebar()
                                          }}
                                        >
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
