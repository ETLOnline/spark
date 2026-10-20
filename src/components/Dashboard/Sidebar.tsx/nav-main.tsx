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

  const closeMobileIfNeeded = () => {
    if (sidebar?.isMobile) {
      sidebar.setOpenMobile(false)
    }
  }

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
                  : item.url === "/" || item.url === "/admin"
                    ? // These are prefixes of every other route in their
                      // section ("/" of the whole site, "/admin" of every
                      // admin page) — prefix-matching below would make them
                      // always-active, so they need an exact match instead.
                      pathName === item.url
                    : pathName === item.url ||
                      pathName.startsWith(item.url + "/") ||
                      pathName.startsWith(item.url + "?") ||
                      (item.extraActivePaths?.some((p) =>
                        // "/x" matches only /x; "/x/*" matches /x and everything under it
                        p.endsWith("/*")
                          ? pathName === p.slice(0, -2) ||
                            pathName.startsWith(p.slice(0, -1))
                          : pathName === p
                      ) ??
                        false)
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
                    {item.items && item.items.length && item.href ? (
                      // Parent with its own page: clicking navigates there and opens the sub-menu
                      // (the chevron on the right still collapses/expands it)
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
                          href={item.href}
                          onClick={() => {
                            if (sidebar?.state === "collapsed")
                              sidebar.toggleSidebar()
                            setOpenItems((prev) => new Set(prev).add(itemKey))
                            closeMobileIfNeeded()
                          }}
                        >
                          {item.icon ? <item.icon /> : null}
                          <span>{item.title}</span>
                          {item?.isPrivate ? (
                            <Lock className="text-sm" height={10} />
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    ) : item.items && item.items.length ? (
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
                            closeMobileIfNeeded()
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
                            {item.items.map((subItem) => {
                              const isSubActive =
                                subItem.url === pathName ||
                                (subItem.url !== item.url &&
                                  pathName.startsWith(subItem.url + "/")) ||
                                pathName.startsWith(subItem.url + "?")
                              return (
                                <TooltipProvider
                                  key={subItem.url + subItem.title}
                                >
                                  <Tooltip delayDuration={300}>
                                    <SidebarMenuSubItem>
                                      <TooltipTrigger asChild>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={isSubActive}
                                        >
                                          <Link
                                            href={subItem.url}
                                            onClick={() => {
                                              if (
                                                sidebar?.state === "collapsed"
                                              )
                                                sidebar.toggleSidebar()
                                              closeMobileIfNeeded()
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
                              )
                            })}
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
