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

const Header = () => {
  const breadcrumbs = useBreadcrumbs()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0 bg-background z-10 rounded-xl border-b ">
      <div className="flex items-center between justify-between w-full gap-2 px-4">
        <div className="flex items-center ">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {/* No need for a hardcoded "Spark" here anymore, useBreadcrumbs handles the root */}
              {breadcrumbs.map((crumb, i) => (
                <BreadcrumbItem key={crumb.href + crumb.label}>
                  {/* Use href as key for stability */}
                  {crumb.isCurrent ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                  {/* Add separator if it's not the last item */}
                  {i !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
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
  )
}

export default Header
