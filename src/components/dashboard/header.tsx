"use client"

import React, { useEffect } from "react"
import { SidebarTrigger } from "../ui/sidebar"
import { Separator } from "@radix-ui/react-separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"
import { ModeToggle } from "../ThemeProvider/ThemeToggle"
import { usePathname } from "next/navigation"

const Header = () => {
  const path: string = usePathname().substring(1)
  const paths: string[] = path.split("/")
  const hrefs: string[] = paths.map((pathName) =>
    path.substring(0, path.indexOf(pathName) + pathName.length)
  )

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center between justify-between w-full gap-2 px-4">
        <div className="flex items-center ">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={"/"}>
                  <BreadcrumbPage>Spark</BreadcrumbPage>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              {hrefs.map((href, i) => (
                <BreadcrumbItem key={href}>
                  <BreadcrumbLink href={href}>
                    <BreadcrumbPage>{paths[i]}</BreadcrumbPage>
                  </BreadcrumbLink>
                  {i !== hrefs.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
