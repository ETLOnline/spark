"use client"

import { SidebarTrigger } from "../../ui/sidebar"
import { Separator } from "@radix-ui/react-separator"
import CommandCenter from "../CommandCenter/CommandCenter"
import ModeToggle from "../../ThemeProvider/ThemeToggle"
import { SignedIn } from "@clerk/nextjs"
import Notifications from "../Notifications/Notifications"
import { useBreadcrumbs } from "@/src/hooks/useBreadcrumbs"
import EntityHierarcy from "../../common/EntitiyHierarcy/EntityHierarcy"
import HeaderBreadcrumbs from "./HeaderBreadcrumbs"
import { useEffect, useRef, useState } from "react"

const Header = () => {
  const breadcrumbs = useBreadcrumbs()
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (window.innerWidth >= 1024) {
        setIsVisible(true)
        lastScrollY.current = currentY
        return
      }
      if (currentY > lastScrollY.current && currentY > 60) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={`sticky top-0 z-20 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <header className="flex h-16 shrink-0 items-center gap-2 bg-background rounded-xl border-b">
        <div className="flex items-center justify-between w-full gap-2 px-4">
          <div className="flex items-center ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* Breadcrumbs inline (md and up) */}
            {breadcrumbs.length > 0 && (
              <div className="hidden md:block mr-2">
                <HeaderBreadcrumbs breadcrumbs={breadcrumbs} />
              </div>
            )}
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

      {/* Breadcrumbs sub-header — small screens only */}
      {breadcrumbs.length > 0 && (
        <div className="md:hidden bg-background rounded-xl border-b px-4 py-2">
          <HeaderBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      )}
    </div>
  )
}

export default Header
