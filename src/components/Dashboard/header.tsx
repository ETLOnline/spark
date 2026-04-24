"use client"

import { SidebarTrigger } from "../ui/sidebar"
import { Separator } from "@radix-ui/react-separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../ui/breadcrumb"
import ModeToggle from "../ThemeProvider/ThemeToggle"
import CommandCenter from "./CommandCenter/CommandCenter"
import { SignedIn } from "@clerk/nextjs"
import Notifications from "./Notifications/Notifications"
import { useBreadcrumbs } from "@/src/hooks/useBreadcrumbs"
import EntityHierarcy from "../common/EntitiyHierarcy/EntityHierarcy"

const Header = () => {
  const breadcrumbs = useBreadcrumbs()

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0 bg-background z-20 rounded-xl border-b ">
        <div className="flex items-center justify-between w-full gap-2 px-4">
          <div className="flex items-center ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <EntityHierarcy />
          </div>
          <SignedIn>
            <CommandCenter />
          </SignedIn>
          <div className="flex items-center gap-2">
            <Notifications />
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Breadcrumbs sub-header (visible on all screens) */}
      {breadcrumbs.length > 0 && (
        <div className="sticky top-16 bg-background z-10 rounded-xl border-b px-4 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, i) => {
                // Determine if the current item is one of the last two
                const isLastTwo = i >= breadcrumbs.length - 2

                return (
                  // Using 'contents' prevents the div from breaking the BreadcrumbList flex layout
                  <div key={crumb.href + crumb.label} className="contents">
                    <BreadcrumbItem>
                      {crumb.isCurrent ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>

                    {/* Add separator if it's not the last item */}
                    {i !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </div>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </div>
  )
}

export default Header
